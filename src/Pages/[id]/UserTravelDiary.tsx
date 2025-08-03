import { useCallback, useEffect, useState } from "react";
import type { ITravelRecording } from "../../Types/types";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { PostContainer } from "../../components/PostContainer";
import { LogOutContainer } from "../../components/LogOutContainer";

export const UserTravelDiary = () => {
  const [data, setData] = useState<ITravelRecording[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  // const userId = JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data
  //   ?.user?.id;

  const navigate = useNavigate();

  const getPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data }: { data: ITravelRecording[] } = await axios.get(
        `/postsByUserId/${id}`
      );
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
    <div>
      <header className="flex justify-end">
        <div className="flex flex-col gap-[10px]">
          <LogOutContainer />
        </div>
      </header>
      {data && data[0] && !isLoading && (
        <h1 className="text-2xl text-center mx-auto my-[20px]">
          Записи путешествия пользователя <br /> {data[0].user.first_name}{" "}
          {data[0].user.last_name}
        </h1>
      )}
      {data &&
        !isLoading &&
        data.map((elem) => {
          return <PostContainer post={elem} key={elem.id} />;
        })}
    </div>
  );
};
