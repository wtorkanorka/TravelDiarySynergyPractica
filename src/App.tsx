import { useCallback, useEffect, useState } from "react";

import "./App.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LogOutContainer } from "./components/LogOutContainer";
import { CreatePostContainer } from "./components/CreatePostContainer";
import type { ITravelRecording } from "./Types/types";
import { PostContainer } from "./components/PostContainer";

function App() {
  const [data, setData] = useState<ITravelRecording[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const getPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data }: { data: ITravelRecording[] } = await axios.get("/posts");
      console.log(data);
      setData(data);
      return data;
    } catch (e: any) {
      console.error(e);
      if (e.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    getPosts();
  }, []);
  return (
    <div className="">
      <header className="flex justify-end">
        <div className="flex flex-col gap-[10px]">
          <LogOutContainer />
          <CreatePostContainer updateData={getPosts} />
        </div>
      </header>
      <div>
        {data &&
          !isLoading &&
          data.map((elem) => {
            return <PostContainer post={elem} key={elem.id} />;
          })}
      </div>
    </div>
  );
}

export default App;
