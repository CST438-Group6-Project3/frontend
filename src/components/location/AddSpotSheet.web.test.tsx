import { fireEvent, render, screen } from "@testing-library/react";
import AddSpotSheet from "./AddSpotSheet.web";
import { MAX_LOCATION_IMAGES } from "../../api/imageUploads";
import type { LocationCategory } from "../../api/locations";

const categories: { value: LocationCategory; label: string }[] = [
  { value: "study_spot", label: "Study" },
  { value: "food", label: "Food" },
  { value: "other", label: "Other" },
];

function renderSheet(overrides = {}) {
  const props = {
    coordinates: { lat: 36.6531234, lng: -121.7975678 },
    categories,
    name: "Library",
    description: "Quiet",
    category: "study_spot" as LocationCategory,
    imageUrls: [] as string[],
    isSaving: false,
    isUploadingImages: false,
    error: null as string | null,
    onNameChange: jest.fn(),
    onDescriptionChange: jest.fn(),
    onCategoryChange: jest.fn(),
    onAddImages: jest.fn(),
    onRemoveImage: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };

  const view = render(<AddSpotSheet {...props} />);
  return { ...view, props };
}

describe("AddSpotSheet web", () => {
  it("does not render without coordinates", () => {
    const { container } = renderSheet({ coordinates: null });

    expect(container).toBeEmptyDOMElement();
  });

  it("renders form fields and coordinates", () => {
    renderSheet();

    expect(screen.getByRole("complementary")).toHaveAttribute(
      "aria-label",
      "Add spot form"
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Library");
    expect(screen.getByLabelText("Description")).toHaveValue("Quiet");
    expect(screen.getByText("Lat: 36.653123")).toBeInTheDocument();
    expect(screen.getByText("Lng: -121.797568")).toBeInTheDocument();
    expect(screen.getByText("Upload images (0/10)")).toBeInTheDocument();
  });

  it("calls change handlers for text and category controls", () => {
    const { props } = renderSheet();

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New spot" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "New notes" },
    });
    fireEvent.click(screen.getByText("Food"));

    expect(props.onNameChange).toHaveBeenCalledWith("New spot");
    expect(props.onDescriptionChange).toHaveBeenCalledWith("New notes");
    expect(props.onCategoryChange).toHaveBeenCalledWith("food");
  });

  it("passes selected image files to the upload callback", () => {
    const { container, props } = renderSheet();
    const fileInput = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const firstFile = new File(["first"], "first.png", { type: "image/png" });
    const secondFile = new File(["second"], "second.jpg", {
      type: "image/jpeg",
    });

    fireEvent.change(fileInput, {
      target: { files: [firstFile, secondFile] },
    });

    expect(props.onAddImages).toHaveBeenCalledWith([
      { file: firstFile, fileName: "first.png", mimeType: "image/png" },
      { file: secondFile, fileName: "second.jpg", mimeType: "image/jpeg" },
    ]);
  });

  it("shows previews and removes selected images", () => {
    const { props } = renderSheet({
      imageUrls: ["https://example.com/one.jpg", "https://example.com/two.jpg"],
    });

    expect(document.querySelectorAll("img")).toHaveLength(2);

    fireEvent.click(screen.getAllByLabelText("Remove image")[1]);

    expect(props.onRemoveImage).toHaveBeenCalledWith(
      "https://example.com/two.jpg"
    );
  });

  it("disables upload at the max image count and while uploading", () => {
    const maxedUrls = Array.from(
      { length: MAX_LOCATION_IMAGES },
      (_, index) => `https://example.com/${index}.jpg`
    );
    const { container, rerender, props } = renderSheet({
      imageUrls: maxedUrls,
    });

    expect(
      container.querySelector('input[type="file"]')
    ).toBeDisabled();

    rerender(
      <AddSpotSheet
        {...props}
        imageUrls={[]}
        isUploadingImages={true}
      />
    );

    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByText("Create spot")).toBeDisabled();
  });

  it("calls submit and close callbacks and displays errors", () => {
    const { props } = renderSheet({ error: "Storage denied" });

    fireEvent.click(screen.getByText("Create spot"));
    fireEvent.click(screen.getByLabelText("Close"));

    expect(screen.getByText("Storage denied")).toBeInTheDocument();
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
