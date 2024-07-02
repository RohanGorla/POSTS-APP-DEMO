import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setfile] = useState();
  const [img, setImg] = useState();
  const [render, setRender] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("submitted");
    // const formData = new FormData();
    // formData.append("photo", file);
    // formData.append("text", "This is some text");
    // formData.entries().forEach((element) => {
    //   console.log(element[0] + " : " + element[1]);
    // });
    // let res = await axios.post("http://localhost:3000/send", formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    // console.log(res);

    // formData.append();
  }

  async function assignURL(e) {
    e.preventDefault();
    console.log(file.type);
    let res = await axios.post("http://localhost:3000/assign", {
      key: "tengen-uzui",
      type: file.type,
    });
    console.log(res.data);
    let res2 = await axios.put(res.data, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
    // let res2 = await axios.put(res.data, file);
    console.log(res2);
    setRender(!render);
  }

  // useEffect(() => {
  //   console.log("file ->", file);
  // }, [file]);

  useEffect(() => {
    async function getUrl() {
      let res = await axios.get("http://localhost:3000/");
      console.log(res.data);
      setImg(res.data);
    }
    getUrl();
  }, [render]);

  return (
    <>
      <h1>Multer - AWS S3 test!</h1>
      <form onSubmit={assignURL}>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => {
            setfile(e.target.files[0]);
          }}
        ></input>
        <input type="submit"></input>
      </form>
      {img && <img style={{ width: "500px" }} src={img}></img>}
    </>
  );
}

export default App;
