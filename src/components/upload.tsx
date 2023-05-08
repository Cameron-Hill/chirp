import type { PropsWithChildren } from "react";
import { toast } from "react-hot-toast";

type UploadProps = {
  setImageUrl: (url: string | null) => void;
  onError?: (err: any) => void;
};

export default function Upload({
  setImageUrl,
  onError,
}: PropsWithChildren<UploadProps>) {
  return (
    <input
      className="cursor-pointer"
      alt="Upload a photo"
      onChange={(e) => {
        console.log("Change event fired.");
        uploadPhoto(e)
          .then((url) => {
            console.log("URL: ", url);
            setImageUrl(url ?? null);
          })
          .catch((err) => {
            if (onError) onError(err);
          });
      }}
      type="file"
      accept="image/png, image/jpeg"
    />
  );
}

const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  console.log(e.target.files);
  const file = e.target.files?.[0];
  if (!file) {
    console.error("No file selected.");
    return;
  }
  const filename = encodeURIComponent(file.name);
  const fileType = encodeURIComponent(file.type);
  const santizedFilename = filename.replace(/%20/g, "+");
  const res = await fetch(
    `/api/upload-url?file=${santizedFilename}&fileType=${fileType}`
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { url, fields } = await res.json();

  console.log(url, fields);
  const formData = new FormData();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  Object.entries({ ...fields, file }).forEach(([key, value]) => {
    formData.append(key, value as string);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const upload = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (upload.ok) {
    console.log("Uploaded successfully!");
    console.log(upload);
  } else {
    console.error("Upload failed.");
  }

  return `${upload.url}${santizedFilename}`;
};
