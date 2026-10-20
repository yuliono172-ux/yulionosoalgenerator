import React from 'react';
import { QuestionIllustration } from './QuestionIllustration';

interface VisualDiagramBoxProps {
  description: string;
  nomorSoal: number;
  imageUrl?: string;
  size?: 'compact' | 'medium' | 'large';
  onUpdateImage?: (newUrl: string) => void;
  isEditable?: boolean;
}

/**
 * VisualDiagramBox - Renders inline pedagogical vector diagrams or custom images
 * directly inside the question, formatted cleanly without obtrusive developer labels.
 */
export const VisualDiagramBox: React.FC<VisualDiagramBoxProps> = ({
  description,
  nomorSoal,
  imageUrl,
  size = 'medium',
  onUpdateImage,
  isEditable = false,
}) => {
  return (
    <QuestionIllustration
      description={description}
      nomorSoal={nomorSoal}
      imageUrl={imageUrl}
      size={size}
      onUpdateImage={onUpdateImage}
      isEditable={isEditable}
    />
  );
};
