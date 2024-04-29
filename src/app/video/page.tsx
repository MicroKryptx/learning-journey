// videoPage.tsx
import { useSearchParams } from 'next/navigation';
import React from 'react';
import VideoPlayer from '../../components/video-player';


export const getServerSideProps = async (context: { query: any; }) => {
  const { query } = context;
  const videoUrl = query.videoUrl;
  
  // Ensure the videoUrl is valid or set a default/fallback
  return {
    props: {
      videoUrl: videoUrl || 'defaultUrl.mp4',
    },
  };
};

const VideoPage = ({ videoUrl }: { videoUrl: string }) => {
  return (
    <div>
      <h1>Watch Our Video</h1>
      <VideoPlayer videoUrl={videoUrl} />
    </div>
  );
};

export default VideoPage;
