import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";
import { ZodError } from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("upload-url.ts. Fetching Presigned URL");

  const bucket = z.string().parse(process.env.S3_BUCKET_NAME);
  const region = z.string().parse(process.env.AWS_REGION);
  const accessKeyId = z.string().parse(process.env.AWS_ACCESS_KEY_ID);
  const secretAccessKey = z.string().parse(process.env.AWS_SECRET_ACCESS_KEY);

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    region: region,
  });

  const key = z.string().parse(req.query.file);
  const fileType = z.string().parse(req.query.fileType);

  const post = await createPresignedPost(s3Client, {
    Bucket: bucket,
    Key: key,
    Fields: {
      key: key,
      "Content-Type": fileType,
    },
    Expires: 600, // seconds
    Conditions: [
      ["content-length-range", 0, 1048576], // up to 1 MB
    ],
  });

  res.status(200).json(post);
}
