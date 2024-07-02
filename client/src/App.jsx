import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [file, setfile] = useState();
  const [cap, setCap] = useState("");
  const [key, setKey] = useState("");
  const [data, setData] = useState();
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

  async function getUrl(key) {
    let res = await axios.post("http://localhost:3000/url", {
      key: key,
    });
    console.log(`Signed url for ${key} ->`, res.data);
    return res.data;
  }

  async function assignURL(e) {
    e.preventDefault();
    // console.log(file.type);
    let res = await axios.post("http://localhost:3000/assign", {
      key: key,
      type: file.type,
      caption: cap,
    });
    // console.log(res.data);
    let res2 = await axios.put(res.data, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
    // let res2 = await axios.put(res.data, file);
    // console.log(res2);
    setRender(!render);
  }

  // useEffect(() => {
  //   console.log("file ->", file);
  // }, [file]);

  useEffect(() => {
    async function getData() {
      let res = await axios.get("http://localhost:3000/");
      // console.log(res);
      // let Posts = [];
      // res.data.forEach(async (post) => {
      //   let url = await getUrl(post.imageTag);
      //   post.url = url;
      //   Posts.push(post);
      //   setData(Posts);
      // });
      setData(res.data);
    }
    getData();
  }, [render]);

  return (
    <>
      <h1>Multer - AWS S3 test!</h1>
      <form onSubmit={assignURL}>
        <div style={{ margin: "1em 0" }}>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => {
              setfile(e.target.files[0]);
            }}
          ></input>
          <input
            type="text"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
            }}
            placeholder="Enter name of the image"
          ></input>
        </div>
        <div>
          <textarea
            cols="50"
            rows="3"
            onChange={(e) => {
              setCap(e.target.value);
            }}
            value={cap}
            placeholder="Enter caption here..."
          ></textarea>
        </div>
        <input type="submit"></input>
      </form>
      {data && (
        <div>
          {data.map((post) => {
            console.log(post);
            return (
              <div
                key={post.id}
                style={{
                  margin: "4em 0",
                  border: "solid white 2px",
                  padding: "1em",
                }}
              >
                <div>
                  <img style={{ width: "500px" }} src={post.url}></img>
                </div>
                <div>
                  <h2>{post.caption}</h2>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export default App;
