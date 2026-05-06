import { SpotImageUpload } from "../../api/imageUploads";
import type { LocationCategory, LocationResponse } from "../../api/locations";
import AddSpotSheet from "./AddSpotSheet.native";
import React from 'react';

type CategoryOption = {
  value: LocationCategory;
  label: string;
};

type Props = {
  location: LocationResponse | null;
  categories: CategoryOption[];
  name: string;
  description: string;
  category: LocationCategory;
  imageUrls: string[];
  isSaving: boolean;
  isUploadingImages: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: LocationCategory) => void;
  onAddImages: (images: SpotImageUpload[]) => void;
  onRemoveImage: (imageUrl: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function EditLocationSheet({
  location,
  categories,
  name,
  description,
  category,
  imageUrls,
  isSaving,
  isUploadingImages,
  error,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onAddImages,
  onRemoveImage,
  onSubmit,
  onClose,
}: Props) {
  return (
    <AddSpotSheet
      coordinates={
        location ? { lat: location.lat, lng: location.lng } : null
      }
      categories={categories}
      title="Edit location"
      submitLabel="Save changes"
      savingLabel="Saving..."
      name={name}
      description={description}
      category={category}
      imageUrls={imageUrls}
      isSaving={isSaving}
      isUploadingImages={isUploadingImages}
      error={error}
      onNameChange={onNameChange}
      onDescriptionChange={onDescriptionChange}
      onCategoryChange={onCategoryChange}
      onAddImages={onAddImages}
      onRemoveImage={onRemoveImage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
}
