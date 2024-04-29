'use client'
import React, { useState } from "react";
import styles from '../css/GenerateVideoButton.module.css'; // Import the CSS module

const GenerateVideoButton = ({ summary }: { summary: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState(false);

  const handleGenerateVideo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ summary }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);  // This will show you the structure of the response object
        console.log('Video URL: ', data.video_url)
        setVideoUrl(data.video_url);  // Make sure to access the 'video_url' property
        setGenerationSuccess(true);
        console.log('Video generation started');
      } else {
        console.error('Failed to generate video');
        setGenerationSuccess(false);
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setGenerationSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`${styles.button} ${generationSuccess ? styles.flashEffect : ''}`}
      onClick={!generationSuccess ? handleGenerateVideo : undefined}
      disabled={isLoading || generationSuccess}
    >
      {generationSuccess ? 
        <a href={videoUrl} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
          View Video
        </a> :
        (isLoading ? 'Generating...' : 'Generate Video')
      }
    </button>
  );
};

export default GenerateVideoButton;
