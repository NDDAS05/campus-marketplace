import React, { useState, useEffect } from "react";
import { authApi } from "../utils/api";
import { getAcademicYear, getValidSemesters } from "../utils/academicYear";

const STREAM_OPTIONS = ["B.Tech", "B.Arch", "M.Tech", "PHD"];
const DEPARTMENT_OPTIONS = ["CST", "IT", "EE", "ME", "CE", "AE", "MME", "MIN", "Architecture"];
const SEMESTER_OPTIONS = ["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"];

// mode: "login" | "signup"
// onAuthSuccess(user): called once the server confirms login/signup
// navigate: the app's fake-router setter, used for the "switch to signup/login" link
// message: optional note shown above the form (e.g. "Please log in to view your profile")
const AuthPage = ({ mode = "login", onAuthSuccess, navigate, message }) => {
  const isSignup = mode === "signup";

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    stream: "",
    department: "",
    semester: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Recomputed on every keystroke to email/stream — cheap, no need to memoize.
  const detectedYear = isSignup ? getAcademicYear(form.email, form.stream) : "";
  // null here means "no restriction" (e.g. year not yet detected, or a
  // 5-year program the backend enum doesn't cover — see academicYear.js)
  const validSemesters = getValidSemesters(detectedYear);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // If the detected year changes (e.g. person picks a different branch, or
  // finishes typing their email) and the previously-picked semester no
  // longer fits inside it, clear it rather than submit an invalid pairing.
  useEffect(() => {
    if (validSemesters && form.semester && !validSemesters.includes(form.semester)) {
      setForm((prev) => ({ ...prev, semester: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedYear]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let data;
      if (isSignup) {
        const payload = {
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        };
        if (form.stream) payload.stream = form.stream;
        if (form.department) payload.department = form.department;
        if (form.semester) payload.semester = form.semester;
        if (detectedYear) payload.year = detectedYear; // silently included; not user-entered

        data = await authApi.register(payload);
      } else {
        data = await authApi.login({ email: form.email, password: form.password });
      }
      onAuthSuccess(data.user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const yearHint = () => {
    if (!isSignup || !form.stream) return null;
    if (form.stream === "PHD") {
      return "PhD programs don't follow a fixed year structure — you can set this later if needed.";
    }
    if (!form.email) {
      return "Enter your email above and we'll detect your year automatically.";
    }
    if (detectedYear) {
      return `Detected year: ${detectedYear}`;
    }
    return "Couldn't detect your year from that email — you can set it later from your profile.";
  };

  return (
    <div className="flex-1 flex justify-center items-center bg-gray-50 dark:bg-gray-950 p-8">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-gray-100">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>

        {message && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">{message}</p>
        )}

        {!isSignup && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-6">
            Use your @students.iiests.ac.in email
          </p>
        )}

        {error && (
          <div className="mb-4 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange("name")}
                required
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={handleChange("username")}
                required
                minLength={5}
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
              />
            </>
          )}

          <input
            type="email"
            placeholder="you@students.iiests.ac.in"
            value={form.email}
            onChange={handleChange("email")}
            required
            className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange("password")}
            required
            minLength={6}
            className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
          />

          {isSignup && (
            <>
              <div className="flex gap-3">
                <select
                  value={form.stream}
                  onChange={handleChange("stream")}
                  className="w-1/2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200"
                >
                  <option value="">Branch</option>
                  {STREAM_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={form.department}
                  onChange={handleChange("department")}
                  className="w-1/2 bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200"
                >
                  <option value="">Dept (optional)</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {yearHint() && (
                <p className="text-xs text-gray-400 dark:text-gray-500 -mt-1 px-1">{yearHint()}</p>
              )}

              <select
                value={form.semester}
                onChange={handleChange("semester")}
                className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none text-gray-700 dark:text-gray-200"
              >
                <option value="">Semester (optional)</option>
                {(validSemesters || SEMESTER_OPTIONS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 bg-black dark:bg-white text-white dark:text-black rounded-full w-full font-medium mt-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Please wait..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
          {isSignup ? (
            <>Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-black dark:text-white font-medium underline">
                Log in
              </button>
            </>
          ) : (
            <>New here?{" "}
              <button onClick={() => navigate("/signup")} className="text-black dark:text-white font-medium underline">
                Sign up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;