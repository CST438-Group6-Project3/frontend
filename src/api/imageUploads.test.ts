import { uploadLocationImages } from "./imageUploads";

const uploadMock = jest.fn();
const getPublicUrlMock = jest.fn();
const mockFrom = jest.fn((_bucketName: string) => ({
  upload: uploadMock,
  getPublicUrl: getPublicUrlMock,
}));

jest.mock("../../lib/supabaseClient", () => ({
  supabase: {
    storage: {
      from: (bucketName: string) => mockFrom(bucketName),
    },
  },
}));

describe("image uploads", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1712345678000);
    jest.spyOn(Math, "random").mockReturnValue(0.123456789);

    uploadMock.mockResolvedValue({ error: null });
    getPublicUrlMock.mockImplementation((path: string) => ({
      data: { publicUrl: `https://cdn.example.com/${path}` },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("uploads files to the location images bucket and returns public URLs", async () => {
    const file = new File(["image-data"], "My Spot.JPG", {
      type: "image/jpeg",
    });

    await expect(
      uploadLocationImages(
        [{ file, fileName: file.name, mimeType: file.type }],
        "user-123"
      )
    ).resolves.toEqual([
      "https://cdn.example.com/user-123/locations/1712345678000-0-4fzzzxjy-my-spot.jpg",
    ]);

    expect(mockFrom).toHaveBeenCalledWith("location-images");
    expect(uploadMock).toHaveBeenCalledWith(
      "user-123/locations/1712345678000-0-4fzzzxjy-my-spot.jpg",
      file,
      {
        contentType: "image/jpeg",
        upsert: false,
      }
    );
  });

  it("uploads native URI images as blobs", async () => {
    const blob = new Blob(["native-image"], { type: "image/png" });
    global.fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue(blob),
    });

    await uploadLocationImages(
      [
        {
          uri: "file:///photo.png",
          fileName: "photo.png",
          mimeType: "image/png",
        },
      ],
      "user-456"
    );

    expect(global.fetch).toHaveBeenCalledWith("file:///photo.png");
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringContaining("photo.png"),
      blob,
      expect.objectContaining({ contentType: "image/png" })
    );
  });

  it("throws when Supabase rejects an upload", async () => {
    uploadMock.mockResolvedValueOnce({ error: new Error("Storage denied") });

    await expect(
      uploadLocationImages(
        [
          {
            file: new File(["bad"], "bad.jpg", { type: "image/jpeg" }),
            fileName: "bad.jpg",
            mimeType: "image/jpeg",
          },
        ],
        "user-123"
      )
    ).rejects.toThrow("Storage denied");
  });

  it("throws when an image has no file or URI", async () => {
    await expect(
      uploadLocationImages(
        [{ fileName: "missing.jpg", mimeType: "image/jpeg" }],
        "user-123"
      )
    ).rejects.toThrow("Image is missing upload data.");
  });
});
