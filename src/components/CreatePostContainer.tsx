"use client";

import React, { useState } from "react";
import type { ITravelRecording } from "../Types/types";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const CreatePostContainer = ({
  updateData,
}: {
  updateData: () => void;
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("yourMeta") ?? "{}")?.data?.user;

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const initialData = {
    user: {
      first_name: user.user_metadata.first_name,
      last_name: user.user_metadata.last_name,
      user_id: user.id,
    },
    title: "",
    description: "",
    cost: "",
    culturalHeritageSites: [],
    evaluation: {
      safety: "",
      population: "",
      vegetation: "",
    },
  };
  const [formData, setFormData] =
    useState<Omit<ITravelRecording, "id">>(initialData);
  const [currentHeritageSite, setCurrentHeritageSite] = useState("");

  const safetyOptions = [
    { value: "Высокая", label: "Высокая" },
    { value: "Средняя", label: "Средняя" },
    { value: "Низкая", label: "Низкая" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEvaluationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      evaluation: {
        ...prev.evaluation,
        [name]: value,
      },
    }));
  };

  const addHeritageSite = () => {
    if (currentHeritageSite.trim()) {
      setFormData((prev) => ({
        ...prev,
        culturalHeritageSites: [
          ...prev.culturalHeritageSites,
          currentHeritageSite.trim(),
        ],
      }));
      setCurrentHeritageSite("");
    }
  };

  const removeHeritageSite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      culturalHeritageSites: prev.culturalHeritageSites.filter(
        (_, i) => i !== index
      ),
    }));
  };

  async function sendData() {
    try {
      setIsLoading(true);
      const data = await axios.post("/createPost", formData);
      console.log("Полученные данные", data);
      setIsCreatingPost(false);
      setFormData(initialData);
      updateData();
      return data;
    } catch (e: any) {
      console.log(e);
      if (e.status == 401) {
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (JSON.stringify(formData) == JSON.stringify(initialData)) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }

    sendData();
  };

  return (
    <div className="max-w-md w-full mx-auto p-4">
      <button
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl shadow-lg transition-colors duration-300 mb-4"
        onClick={() => setIsCreatingPost((prev) => !prev)}
      >
        {isCreatingPost
          ? "Отменить создание записи"
          : "Создать запись о путешествии"}
      </button>

      {isCreatingPost && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-lg space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Новая запись о путешествии
          </h2>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Название места
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите название места"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-y"
              placeholder="Опишите это место"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Стоимость посещения
            </label>
            <input
              type="text"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Например: $$$ или 1000-2000 руб."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Места культурного наследия
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentHeritageSite}
                onChange={(e) => setCurrentHeritageSite(e.target.value)}
                className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Добавьте место"
              />
              <button
                type="button"
                onClick={addHeritageSite}
                className="px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>

            {formData.culturalHeritageSites.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.culturalHeritageSites.map((site, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{site}</span>
                    <button
                      type="button"
                      onClick={() => removeHeritageSite(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Оценка места</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Безопасность
                </label>
                <select
                  name="safety"
                  value={formData.evaluation.safety}
                  onChange={handleEvaluationChange}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Выберите вариант</option>
                  {safetyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Население
                </label>
                <input
                  type="text"
                  name="population"
                  value={formData.evaluation.population}
                  onChange={handleEvaluationChange}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: 1.2 млн"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Растительность
                </label>
                <input
                  type="text"
                  name="vegetation"
                  value={formData.evaluation.vegetation}
                  onChange={handleEvaluationChange}
                  className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Умеренная"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 ${
              isLoading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
            }   text-white font-medium rounded-xl shadow transition-colors duration-300 mt-4`}
          >
            {isLoading ? "Отправка..." : "Сохранить запись"}
          </button>
        </form>
      )}
    </div>
  );
};
