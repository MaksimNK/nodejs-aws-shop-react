import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import { useAlert } from "~/components/Alert/Alert";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const { showAlert } = useAlert();
  const authorization_token = localStorage.getItem("authorization_token");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async () => {
    if (!authorization_token) {
      showAlert("Authorization token not found. Please log in again.", "error");
      return;
    }

    let response;
    try {
      console.log(`Authorization = Basic ${authorization_token}`);
      response = await axios({
        method: "GET",
        url,
        params: { name: encodeURIComponent(file!.name) },
        headers: { Authorization: `Basic ${authorization_token}` },
      });

      if (response.status === 401) {
        showAlert("Unauthorized: Please log in again", "error");
        return;
      }
      if (response.status === 403) {
        showAlert("Forbidden: Invalid credentials", "error");
        return;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 401) {
            showAlert("401 (Unauthorized)", "error");
          } else if (error.response.status === 403) {
            showAlert("403 (Forbidden) - you don't have permission", "error");
          } else {
            showAlert("Error: Unknown error", "error");
          }
        } else if (error.request) {
          showAlert("No response", "error");
        } else {
          showAlert("Error setting up request: " + error.message, "error");
        }
      } else {
        showAlert("An unexpected error occurred", "error");
      }
      return;
    }

    console.log("File to upload: ", file?.name);
    console.log("Uploading to: ", response.data);

    let result;
    try {
      result = await fetch(response.data, {
        method: "PUT",
        headers: {
          "Content-Type": "text/csv",
        },
        body: file,
      });
    } catch (error) {
      showAlert("Error uploading file", "error");
      return;
    }

    console.log("Result: ", result);

    if (result.ok) {
      showAlert("File uploaded successfully", "success");
    } else {
      showAlert("Error uploading file", "error");
    }

    setFile(null);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
