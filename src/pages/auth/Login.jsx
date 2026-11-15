import {Link, useLocation, useNavigate} from "react-router-dom";
import {useState} from "react";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  GraduationCap,
  UserRound,
  Headphones,
} from "lucide-react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useLanguage} from "../../i18n/index.jsx";
import dashboardPath from "../../utils/dashboardPath";
import {useAuth} from "../../contexts/AuthContext";
import {useToast} from "../../contexts/ToastContext";
import {DEMO_ACCOUNTS} from "../../data/seed";
import Button from "../../components/common/Button";
import {Input, FormField} from "../../components/common/FormControls";
import Logo from "../../components/common/Logo";

export default function Login() {
  const {t} = useLanguage();
  const {login} = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const schema = z.object({
    email: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .email(t("validation.invalidEmail")),
    password: z.string().min(1, t("validation.required")),
  });
  const {
    register,
    handleSubmit,
    setValue,
    formState: {errors, isSubmitting},
  } = useForm({resolver: zodResolver(schema)});

  const onSubmit = (values) => {
    setAuthError("");
    const res = login(values.email, values.password);
    if (!res.ok) {
      setAuthError(
        res.error === "suspended"
          ? t("auth.suspendedAccount")
          : t("auth.invalidCredentials"),
      );
      return;
    }
    toast.success(t("auth.loginSuccess"));
    const from = location.state?.from;
    const dest = from || dashboardPath(res.user.role);
    navigate(dest, {replace: true});
  };

  const fillDemo = (account) => {
    setValue("email", account.email, {shouldValidate: true});
    setValue("password", account.password, {shouldValidate: true});
    setAuthError("");
  };

  const demoIcons = {
    admin: ShieldCheck,
    instructor: GraduationCap,
    student: UserRound,
    sales: Headphones,
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-light-bg px-4 sm:px-8 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 lg:hidden">
          <Logo />
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t("auth.loginSubtitle")}</p>

        {authError && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold px-4 py-3"
          >
            {authError}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-5 grid gap-4"
        >
          <FormField
            label={t("auth.email")}
            htmlFor="email"
            required
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              invalid={!!errors.email}
              {...register("email")}
            />
          </FormField>
          <FormField
            label={t("auth.password")}
            htmlFor="password"
            required
            error={errors.password?.message}
          >
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                invalid={!!errors.password}
                className="pe-12"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute top-1/2 -translate-y-1/2 inset-e-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </FormField>
          <div className="flex items-center justify-end -mt-1">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            icon={LogIn}
            className="w-full"
          >
            {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            {t("nav.register")}
          </Link>
        </p>

        {/* Demo accounts */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {t("auth.demoAccounts")}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = demoIcons[acc.role];
              return (
                <button
                  key={acc.role}
                  onClick={() => fillDemo(acc)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 py-3 px-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
                >
                  <Icon
                    size={20}
                    className="text-emerald-600"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold text-slate-700">
                    {t(
                      `auth.demo${acc.role.charAt(0).toUpperCase() + acc.role.slice(1)}`,
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            {t("auth.demoNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
