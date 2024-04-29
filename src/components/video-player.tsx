'use client'
import React, { useRef, useState } from 'react';
import * as Toggle from '@radix-ui/react-toggle';
import * as Slider from '@radix-ui/react-slider';
import styles from './css/VideoPlayer.module.css';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50); // Default volume is 50%

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
    }
  };

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} src={videoUrl} />
      <div className={styles.controls}>
        <Toggle.Root pressed={isPlaying} onPressedChange={togglePlayPause} className={styles.playPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </Toggle.Root>
        <Slider.Root value={[volume]} onValueChange={handleVolumeChange} className={styles.slider}>
          <Slider.Track className={styles.track}>
            <Slider.Range className={styles.range} />
          </Slider.Track>
          <Slider.Thumb className={styles.thumb} />
        </Slider.Root>
      </div>
    </div>
  );
};

export default VideoPlayer;
