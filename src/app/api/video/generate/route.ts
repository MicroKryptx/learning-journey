import axios from "axios";
import { NextResponse } from "next/server";

// Google Cloud Storage bucket URL
const google_public_bucket_url = "https://storage.cloud.google.com/brainrot-plus/";

export async function POST(req: Request, res: Response) {
    // Parse the request body
    const body = await req.json();

    // Set the video summary from the request body
    const { summary } = body;
    
    // Construct the json object to send to the video generation API
    const json_summary = {
        q: summary
    };

    // Post to video generation API with the summary
    try {
        const response = await axios.post(`${process.env.VID_GEN_URL}/generate`, json_summary, {
        headers:{
                'Content-Type': 'application/json'  
            }
        });
        if (response.status == 200){
            console.log(response.data);
            const videoUrl = google_public_bucket_url + response.data + '.mp4';  // Make sure 'response.data.video_url' is the correct path.
            console.log("Full video URL: ", videoUrl)
            return NextResponse.json({ success: true, video_url: videoUrl });
        }        
        else {
            console.error('Failed to generate video');
        }
    }
    catch (error) {
        console.error('Error generating video:', error);
        return NextResponse.json({success: false});
    }
}