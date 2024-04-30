from fastapi import FastAPI
from pydantic import BaseModel
from langchain.document_loaders import S3FileLoader
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid, uuid4


def getUUID():
    return str(uuid.uuid4())


from datetime import datetime
from google.generative_ai import GeminiAPI
import re
import os
import dotenv
import json
import boto3

dotenv.load_dotenv()
geminiAPI = GeminiAPI(os.getenv("API_KEY"))
os.environ["AWS_ACCESS_KEY_ID"] = os.getenv("NEXT_PUBLIC_S3_ACCESS_KEY_ID")
os.environ["AWS_SECRET_ACCESS_KEY"] = os.getenv("NEXT_PUBLIC_S3_SECRET_ACCESS_KEY")
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("NEXT_PUBLIC_S3_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("NEXT_PUBLIC_S3_SECRET_ACCESS_KEY"),
)

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GetS3ContentRequestBody(BaseModel):
    s3_file_key: str

@app.get("/")
def health_check():
    print("health check!")
    return True

@app.post("/api/get-s3-content")
async def get_s3_content(body: GetS3ContentRequestBody):
    loader = S3FileLoader(os.getenv("NEXT_PUBLIC_S3_BUCKET_NAME"), body.s3_file_key)
    content = json.loads(loader.load()[0].json())["page_content"]
    return content


@app.post("/api/get-summarised-s3-content")
async def get_summarised_s3_content(body: GetS3ContentRequestBody):
    loader = S3FileLoader(os.getenv("NEXT_PUBLIC_S3_BUCKET_NAME"), body.s3_file_key)
    content = json.loads(loader.load()[0].json())["page_content"]

    model = geminiAPI.getGenerativeModel(model="gemini-pro")

    prompt = {
        "messages": [
            {
                "role": "system",
                "content": "You are an AI capable of generating text summaries"
            },
            {
                "role": "user",
                "content": f"""
please summarise the following text: \n\n{content}\n\nsummary:
"""
            }
        ]
    }

    result = await model.generateContent(prompt)

    response = await result.response
    data = await response.json()

    res = data["choices"][0]["message"]["content"]
    return res


class GenerateRequestBody(BaseModel):
    content: str

@app.post("/api/generate")
async def generate(body: GenerateRequestBody):
    print("generating for content" + body.content[:10])

    model = geminiAPI.getGenerativeModel(model="gemini-pro")

    prompt = {
        "messages": [
            {
                "role": "system",
                "content": "You are an AI capable of generating mermaid MD diagrams."
            },
            {
                "role": "user",
                "content": """
follow the new mindmap syntax here to generate the mindmap mermaid diagram:

mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
"""
            },
            {
                "role": "user",
                "content": f"""Generate a mindmap mermaid diagram based on the following text: \n\n{body.content}\n\nmermaid diagram:"""
            }
        ]
    }

    result = await model.generateContent(prompt)

    response = await result.response
    data = await response.json()

    res = data["choices"][0]["message"]["content"]
    # extract out the content from between the ```mermaid and ``` tags
    res = re.search(r"```mermaid(.*)```", res, re.DOTALL).group(1)
    res = res.replace("```", "")

    random_input_file = f"input-{uuid4()}.mmd"
    random_output_file = f"output-{uuid4()}.png"

    # output the res into a input.mmd file
    with open(random_input_file, "w") as f:
        f.write(res)
    
    try:
        os.system(
            f"mmdc -i {random_input_file} -o {random_output_file} -t dark -b transparent -p puppeteer-config.json"
        )
        s3.upload_file(
            random_output_file,
            os.getenv("NEXT_PUBLIC_S3_BUCKET_NAME"),
            f"mermaid/{random_output_file}",
        )
        # delete the input and output files
        os.remove(random_input_file)
        os.remove(random_output_file)
        # return the s3 url
        res = (
            "https://"
            + os.getenv("NEXT_PUBLIC_S3_BUCKET_NAME")
            + f".s3.ap-southeast-1.amazonaws.com/mermaid/{random_output_file}"
        )
        print(res)
        return res
    except Exception as e:
        return ""
