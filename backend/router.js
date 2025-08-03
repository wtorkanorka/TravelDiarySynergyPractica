import { createClient } from "@supabase/supabase-js";
import { Router } from "express";
import { v4 as uuidv4 } from "uuid";

const router = new Router();

const supabase = createClient(
  process.env.SUPABASE_URL || "https://bkpoehpfhwendzbcmzuf.supabase.co",

  process.env.SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcG9laHBmaHdlbmR6YmNtenVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNTg4MjEsImV4cCI6MjA2NTczNDgyMX0.nViaDaNuPGOVlUqSKBUTzMaBFBcjj97Ik8I_5cmaB1c"
);

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // 1. Регистрация пользователя в Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Метаданные пользователя
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) throw authError;

    if (authData.confirmation_sent_at !== "")
      res.status(500).json({
        error:
          "На почту было отправлено письмо, после подтверждения следует перейти на страницу логина",
      });

    if (authData.user.email_confirmed_at !== "") {
      const { data: dataAdmintable, error: errorAdmintable } = await supabase
        .from("admins")
        .insert([{ user_id: authData.user.id, is_admin: false }]);

      if (errorAdmintable) throw errorAdmintable;
    }

    // 2. Сохранение профиля в отдельной таблице (если нужно)
    // if (authData.user) {
    //   const { error: profileError } = await supabase.from("profiles").insert([
    //     {
    //       id: authData.user.id,
    //       email: authData.user.email,
    //       first_name: firstName,
    //       last_name: lastName,
    //       created_at: new Date().toISOString(),
    //     },
    //   ]);

    //   if (profileError) throw profileError;
    // }
    // console.log("authData", authData);
    res.status(200).json(authData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Вход
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.status(200).json(data);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

// Получение текущей сессии
router.get("/session", async (req, res) => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Выход
router.post("/logout", async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.status(200).json({ message: "Logged out successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Защищенные маршруты (пример)
router.get("/protected", async (req, res) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.status(200).json({ message: "Protected data", user: session.user });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { data, error } = await supabase.from("TravelRecordings").select("*");
    if (error) {
      return res.status(500).json({ error: error });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json(e);
  }
});
router.get("/postsByUserId/:id", async (req, res) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.params.id;

    const { data, error } = await supabase
      .from("TravelRecordings")
      .select("*")
      .eq("user->>user_id", userId);
    if (error) {
      return res.status(500).json({ error: error });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json(e);
  }
});
router.put("/updatePostById/:id", async (req, res) => {
  try {
    // 1. Проверка аутентификации пользователя
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const postId = req.params.id;
    const updatedData = req.body;
    console.log(updatedData.updatedData);
    // 2. Проверка существования поста и прав доступа
    const { data: existingPost, error: fetchError } = await supabase
      .from("TravelRecordings")
      .select("user->>user_id")
      .eq("id", postId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.user_id !== user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own posts" });
    }

    // 3. Обновление данных
    const { data, error } = await supabase
      .from("TravelRecordings")
      .update({
        title: updatedData.title,
        description: updatedData.description,
        cost: updatedData.cost,
        culturalHeritageSites: updatedData.culturalHeritageSites,
        evaluation: updatedData.evaluation,
      })
      .eq("id", postId)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // 4. Возвращаем обновленный пост
    res.status(200).json(data[0]);
  } catch (e) {
    console.error("Error updating post:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createPost", async (req, res) => {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const { data, error } = await supabase
      .from("TravelRecordings")
      .insert(req.body)
      .select();
    if (error) {
      return res.status(500).json({ error: error });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json(e);
  }
});

export default router;
