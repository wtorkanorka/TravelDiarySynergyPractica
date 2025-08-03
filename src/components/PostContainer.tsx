import { Link, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { ITravelRecording } from "../Types/types";
import axios from "axios";

export const PostContainer = ({ post }: { post: ITravelRecording }) => {
  const navigate = useNavigate();
  const [updatedData, setUpdatedData] = useState<ITravelRecording>(post);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState(updatedData);
  const [isLoading, setIsLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data
    ?.user?.id;

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case "Высокая":
        return "bg-green-100 text-green-800";
      case "Средняя":
        return "bg-yellow-100 text-yellow-800";
      case "Низкая":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const { id } = useParams<{ id: string }>();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedPost((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedPost((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        [name]: value,
      },
    }));
  };

  const handleHeritageSiteChange = (index: number, value: string) => {
    const newSites = [...editedPost.culturalHeritageSites];
    newSites[index] = value;
    setEditedPost((prev) => ({ ...prev, culturalHeritageSites: newSites }));
  };

  async function updatePost() {
    try {
      setIsLoading(true);
      const data = await axios.put(
        `/updatePostById/${updatedData.id}`,
        editedPost
      );

      setIsEditing(false);
      setUpdatedData(data.data);
      return data;
    } catch (e: any) {
      console.log(e);
      if (e.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    try {
      updatePost();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mb-6 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Заголовок и автор */}
        <div className="flex items-center justify-between mb-4">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedPost.title}
              onChange={handleInputChange}
              className="text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">
              {updatedData.title}
            </h2>
          )}

          <div className="flex flex-col gap-[10px] items-end">
            {!id && (
              <Link
                to={`/userTravelDiary/${updatedData.user.user_id}`}
                className="flex items-center"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {updatedData.user.first_name[0]}
                  {updatedData.user.last_name[0]}
                </div>
                <span className="ml-2 text-gray-600">
                  {updatedData.user.first_name} {updatedData.user.last_name}
                </span>
              </Link>
            )}
            {userId == updatedData.user.user_id && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      disabled={isLoading}
                      onClick={handleSave}
                      className={`p-[10px] rounded-[20px] text-center ${
                        isLoading ? "bg-green-200" : "bg-green-500"
                      } text-white hover:bg-green-600`}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-[10px] rounded-[20px] text-center bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Отмена
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-[10px] rounded-[20px] text-center bg-amber-400 hover:bg-amber-500"
                  >
                    Дополнить запись
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Описание */}
        {isEditing ? (
          <textarea
            name="description"
            value={editedPost.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        ) : (
          <p className="text-gray-600 mb-4">{updatedData.description}</p>
        )}

        {/* Стоимость */}
        <div className="mb-4">
          {isEditing ? (
            <input
              type="text"
              name="cost"
              value={editedPost.cost}
              onChange={handleInputChange}
              className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold border border-blue-200 focus:outline-none focus:border-blue-500"
              placeholder="Стоимость"
            />
          ) : (
            <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
              Стоимость: {updatedData.cost}
            </span>
          )}
        </div>

        {/* Места культурного наследия */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Места культурного наследия:
          </h3>
          {isEditing ? (
            <div className="space-y-2">
              {editedPost.culturalHeritageSites.map((site, index) => (
                <input
                  key={index}
                  type="text"
                  value={site}
                  onChange={(e) =>
                    handleHeritageSiteChange(index, e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {updatedData.culturalHeritageSites.map((site, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                >
                  {site}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Оценки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Безопасность
            </h4>
            {isEditing ? (
              <select
                name="safety"
                value={editedPost.evaluation.safety}
                onChange={handleEvaluationChange}
                className={`text-sm font-semibold px-2 py-1 rounded-full ${getSafetyColor(
                  editedPost.evaluation.safety
                )} border border-gray-300`}
              >
                <option value="Высокая">Высокая</option>
                <option value="Средняя">Средняя</option>
                <option value="Низкая">Низкая</option>
              </select>
            ) : (
              <span
                className={`text-sm font-semibold px-2 py-1 rounded-full ${getSafetyColor(
                  updatedData.evaluation.safety
                )}`}
              >
                {updatedData.evaluation.safety}
              </span>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Население
            </h4>
            {isEditing ? (
              <input
                type="text"
                name="population"
                value={editedPost.evaluation.population}
                onChange={handleEvaluationChange}
                className="text-gray-800 font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">
                {updatedData.evaluation.population}
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 mb-1">
              Растительность
            </h4>
            {isEditing ? (
              <input
                type="text"
                name="vegetation"
                value={editedPost.evaluation.vegetation}
                onChange={handleEvaluationChange}
                className="text-gray-800 font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-gray-800 font-medium">
                {updatedData.evaluation.vegetation}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
