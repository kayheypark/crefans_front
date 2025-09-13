"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Spin, Image, Button } from 'antd';
import { PictureOutlined, PlayCircleOutlined, SoundOutlined } from '@ant-design/icons';
import { MediaResponse } from '@/types/posting';
import { useResponsive } from '@/hooks/useResponsive';

interface PostMediaGalleryProps {
  medias: MediaResponse[];
  isMembershipOnly?: boolean;
  hasAccess?: boolean;
  className?: string;
}

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnailUrl?: string;
  isProcessed: boolean;
}

const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({
  medias,
  isMembershipOnly = false,
  hasAccess = true,
  className = ''
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { isMobile, isTablet } = useResponsive();

  // 미디어 데이터 변환 및 최적화
  const processedMedias = useMemo((): MediaItem[] => {
    return medias?.map(media => ({
      id: media.id,
      type: media.type,
      url: media.mediaUrl,
      thumbnailUrl: media.thumbnailUrls?.small || media.thumbnailUrls?.medium || media.mediaUrl,
      isProcessed: media.processingStatus === 'completed'
    })) || [];
  }, [medias]);

  // 이미지와 비디오 분리
  const { images, videos, others } = useMemo(() => {
    const images = processedMedias.filter(m => m.type.startsWith('image/'));
    const videos = processedMedias.filter(m => m.type.startsWith('video/'));
    const others = processedMedias.filter(m => !m.type.startsWith('image/') && !m.type.startsWith('video/'));
    
    return { images, videos, others };
  }, [processedMedias]);

  const handleImageLoad = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({ ...prev, [mediaId]: false }));
  }, []);

  const handleImageLoadStart = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({ ...prev, [mediaId]: true }));
  }, []);

  // 권한 없는 경우 블러 처리된 미리보기
  const renderAccessDeniedOverlay = (count: number, type: string) => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderRadius: 8
      }}
    >
      <div style={{ fontSize: 24, color: '#999', marginBottom: 8 }}>
        {type === 'image' ? <PictureOutlined /> : <PlayCircleOutlined />}
      </div>
      <div style={{ color: '#666', fontSize: 14, fontWeight: 500 }}>
        {type === 'image' ? `이미지 ${count}장` : `동영상 ${count}개`}
      </div>
      <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
        멤버십 구독 필요
      </div>
    </div>
  );

  // 단일 이미지 렌더링
  const renderSingleImage = (media: MediaItem) => (
    <div key={media.id} style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      <Image
        src={hasAccess ? media.url : media.thumbnailUrl}
        alt="게시물 이미지"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: 500,
          objectFit: 'cover',
          display: 'block'
        }}
        preview={hasAccess}
        onLoad={() => handleImageLoad(media.id)}
        onLoadStart={() => handleImageLoadStart(media.id)}
        placeholder={
          <div style={{ 
            height: 200, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#f5f5f5'
          }}>
            <Spin />
          </div>
        }
      />
      {loadingStates[media.id] && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.8)'
        }}>
          <Spin />
        </div>
      )}
      {!hasAccess && renderAccessDeniedOverlay(1, 'image')}
    </div>
  );

  // 다중 이미지 그리드 렌더링 (반응형)
  const renderMultipleImages = (imageList: MediaItem[]) => {
    const count = imageList.length;
    const gridHeight = isMobile ? 250 : isTablet ? 350 : 400;
    const gap = isMobile ? 2 : 4;
    
    if (count === 2) {
      return (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap, 
          borderRadius: 8, 
          overflow: 'hidden' 
        }}>
          {imageList.slice(0, 2).map((media) => renderGridImage(media))}
        </div>
      );
    }
    
    if (count === 3) {
      return (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
          gap, 
          height: gridHeight, 
          borderRadius: 8, 
          overflow: 'hidden' 
        }}>
          {isMobile ? (
            // 모바일: 세로 스택
            <>
              {renderGridImage(imageList[0], { height: gridHeight / 2 })}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: gridHeight / 2 }}>
                {imageList.slice(1, 3).map((image) => renderGridImage(image, { height: '100%' }))}
              </div>
            </>
          ) : (
            // 데스크톱: 기존 레이아웃
            <>
              <div style={{ position: 'relative' }}>
                {renderGridImage(imageList[0], { height: '100%' })}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap }}>
                {imageList.slice(1, 3).map((image) => renderGridImage(image, { height: '100%' }))}
              </div>
            </>
          )}
        </div>
      );
    }
    
    if (count >= 4) {
      return (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
          gap, 
          height: gridHeight, 
          borderRadius: 8, 
          overflow: 'hidden' 
        }}>
          {isMobile ? (
            // 모바일: 2x2 그리드
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: gridHeight / 2 }}>
                {imageList.slice(0, 2).map((image) => renderGridImage(image, { height: '100%' }))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, height: gridHeight / 2 }}>
                {renderGridImage(imageList[2], { height: '100%' })}
                <div style={{ position: 'relative' }}>
                  {renderGridImage(imageList[3], { height: '100%' })}
                  {count > 4 && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 600
                    }}>
                      +{count - 4}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            // 데스크톱: 기존 레이아웃
            <>
              <div style={{ position: 'relative' }}>
                {renderGridImage(imageList[0], { height: '100%' })}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap }}>
                {imageList.slice(1, 3).map((image) => renderGridImage(image, { height: '100%' }))}
                <div style={{ position: 'relative' }}>
                  {renderGridImage(imageList[3], { height: '100%' })}
                  {count > 4 && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0, 0, 0, 0.6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 18,
                      fontWeight: 600
                    }}>
                      +{count - 4}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      );
    }
    
    return null;
  };

  // 그리드 이미지 렌더링
  const renderGridImage = (media: MediaItem, style?: React.CSSProperties) => (
    <div key={media.id} style={{ position: 'relative', ...style }}>
      <Image
        src={hasAccess ? media.url : media.thumbnailUrl}
        alt="게시물 이미지"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
        preview={hasAccess}
        onLoad={() => handleImageLoad(media.id)}
        onLoadStart={() => handleImageLoadStart(media.id)}
      />
      {loadingStates[media.id] && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.8)'
        }}>
          <Spin size="small" />
        </div>
      )}
    </div>
  );

  // 비디오 렌더링
  const renderVideo = (media: MediaItem) => (
    <div key={media.id} style={{ position: 'relative', width: '100%', borderRadius: 8, overflow: 'hidden' }}>
      {hasAccess ? (
        <video
          controls
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: isMobile ? 300 : 500,
            objectFit: 'cover'
          }}
          poster={media.thumbnailUrl}
          preload="metadata"
        >
          <source src={media.url} type={media.type} />
          브라우저가 비디오를 지원하지 않습니다.
        </video>
      ) : (
        <div style={{
          width: '100%',
          height: isMobile ? 250 : 300,
          background: `url(${media.thumbnailUrl}) center/cover`,
          position: 'relative',
          filter: 'blur(4px)'
        }}>
          {renderAccessDeniedOverlay(1, 'video')}
        </div>
      )}
    </div>
  );

  // 기타 미디어 렌더링
  const renderOtherMedia = (media: MediaItem) => (
    <div key={media.id} style={{
      padding: 16,
      border: '1px solid #d9d9d9',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <SoundOutlined style={{ fontSize: 24, color: '#1890ff' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500 }}>{media.type}</div>
        <div style={{ fontSize: 12, color: '#999' }}>
          {hasAccess ? '재생 가능' : '멤버십 구독 필요'}
        </div>
      </div>
      {hasAccess && (
        <Button type="primary" size="small">
          재생
        </Button>
      )}
    </div>
  );

  if (!processedMedias.length) {
    return null;
  }

  return (
    <div className={className} style={{ width: '100%', marginTop: 16 }}>
      {/* 이미지 렌더링 */}
      {images.length === 1 && renderSingleImage(images[0])}
      {images.length > 1 && (
        <div style={{ position: 'relative' }}>
          {renderMultipleImages(images)}
          {!hasAccess && renderAccessDeniedOverlay(images.length, 'image')}
        </div>
      )}

      {/* 비디오 렌더링 */}
      {videos.length > 0 && (
        <div style={{ marginTop: images.length > 0 ? 8 : 0 }}>
          {videos.map(renderVideo)}
        </div>
      )}

      {/* 기타 미디어 렌더링 */}
      {others.length > 0 && (
        <div style={{ marginTop: (images.length > 0 || videos.length > 0) ? 8 : 0 }}>
          {others.map(renderOtherMedia)}
        </div>
      )}

      {/* 미디어 카운트 표시 (반응형) */}
      {(images.length > 0 || videos.length > 0) && (
        <div style={{
          position: 'absolute',
          right: isMobile ? 8 : 12,
          bottom: isMobile ? 8 : 12,
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: isMobile ? 12 : 16,
          padding: isMobile ? '2px 8px' : '4px 12px',
          display: 'flex',
          alignItems: 'center',
          color: '#fff',
          fontSize: isMobile ? 12 : 14,
          gap: 4,
          zIndex: 5
        }}>
          {images.length > 0 && (
            <>
              <PictureOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
              <span>{images.length}</span>
            </>
          )}
          {videos.length > 0 && (
            <>
              {images.length > 0 && <span style={{ margin: '0 4px' }}>•</span>}
              <PlayCircleOutlined style={{ fontSize: isMobile ? 12 : 14 }} />
              <span>{videos.length}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostMediaGallery;