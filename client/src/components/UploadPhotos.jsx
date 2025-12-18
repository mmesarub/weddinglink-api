import { useParams } from "react-router-dom";
import { useState } from "react";
import api from "../api";

function UploadPhotos() {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [valid, setValid] = useState(false);
  const [file, setFile] = useState(null);

  const checkCode = async () => {
    const res = await api.post(`/photos/check/${id}`, {

      code,
    });
    setValid(res.data.valid);
  };

  const uploadPhoto = async () => {
    const fd = new FormData();
    fd.append("photo", file);

    await api.post(`/photos/upload/${id}`, fd);

    alert("Foto subida ❤️");
  };

  if (!valid) {
    return (
      <>
        <h2>Subir fotos de la boda</h2>
        <input
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de fotos"
        />
        <button onClick={checkCode}>Entrar</button>
      </>
    );
  }

  return (
    <>
      <h2>Sube tus fotos 📸</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadPhoto}>Subir</button>
    </>
  );
}

export default UploadPhotos;
