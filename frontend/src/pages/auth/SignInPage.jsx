import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

const ROLE_IDS = [1, 2, 3, 4];

/*
|--------------------------------------------------------------------------
| Role helpers
|--------------------------------------------------------------------------
*/

const getRolePath = (roleId) => {
    switch (Number(roleId)) {
        case 1:
            return "/super-admin/dashboard";

        case 2:
            return "/students/dashboard";

        case 3:
            return "/coordinator/dashboard";

        case 4:
            return "/company/dashboard";

        default:
            return null;
    }
};


/*
|--------------------------------------------------------------------------
| Login API
|--------------------------------------------------------------------------
|
| Your backend currently requires:
|
| {
|   email,
|   password,
|   role_id
| }
|
| Therefore we send the role_id here.
|
| 401 means:
| "The credentials may be valid, but this isn't the user's role."
|
| We return null instead of throwing.
|
*/

const loginWithRole = async (email, password, roleId) => {
    try {
        const response = await fetch(`${BASE_URL}/users/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                email,
                password,
                role_id: roleId,
            }),
        });

        let data = null;

        try {
            data = await response.json();
        } catch {
            data = null;
        }


        /*
        |--------------------------------------------------------------------------
        | 401
        |--------------------------------------------------------------------------
        |
        | Expected when trying the wrong role.
        |
        */

        if (response.status === 401) {
            return null;
        }


        /*
        |--------------------------------------------------------------------------
        | 403
        |--------------------------------------------------------------------------
        |
        | For example, Organization/Company account isn't approved.
        |
        */

        if (response.status === 403) {
            throw new Error(
                data?.message ||
                "Your account is not approved."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | 429
        |--------------------------------------------------------------------------
        */

        if (response.status === 429) {
            throw new Error(
                data?.message ||
                "Too many login attempts. Please wait and try again."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Other errors
        |--------------------------------------------------------------------------
        */

        if (!response.ok || data?.success === false) {
            throw new Error(
                data?.message ||
                `Login failed. Server returned ${response.status}.`
            );
        }


        /*
        |--------------------------------------------------------------------------
        | Successful login
        |--------------------------------------------------------------------------
        */

        return data;

    } catch (error) {

        /*
        |--------------------------------------------------------------------------
        | Network error
        |--------------------------------------------------------------------------
        |
        | This is different from a backend 401.
        |
        */

        if (
            error instanceof TypeError &&
            error.message
        ) {
            throw new Error(
                "Unable to connect to the server."
            );
        }

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Sign In Page
|--------------------------------------------------------------------------
*/

export default function SignInPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | Handle Login
    |--------------------------------------------------------------------------
    */

const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
        setError("Please enter your email.");
        return;
    }

    if (!password) {
        setError("Please enter your password.");
        return;
    }

    setLoading(true);

    try {
        const roleStorageKey = `login_role_id_${cleanEmail}`;

        const storedRoleId = Number(
            localStorage.getItem(roleStorageKey)
        );

        let result = null;

        // =====================================================
        // CASE 1:
        // We already know this email's role
        // =====================================================

        if ([1, 2, 3, 4].includes(storedRoleId)) {

            result = await loginWithRole(
                cleanEmail,
                password,
                storedRoleId
            );

            // -------------------------------------------------
            // Saved role failed.
            // Do NOT automatically try other roles.
            // -------------------------------------------------

            if (!result) {
                throw new Error(
                    "Invalid email or password."
                );
            }
        }

        // =====================================================
        // CASE 2:
        // First login - role is unknown
        // =====================================================

        else {

            for (const roleId of [1, 2, 3, 4]) {

                const response = await loginWithRole(
                    cleanEmail,
                    password,
                    roleId
                );

                // 401 = wrong role, continue
                if (!response) {
                    continue;
                }

                if (
                    response.success &&
                    response.data
                ) {
                    result = response;
                    break;
                }
            }

            if (!result?.success || !result?.data) {
                throw new Error(
                    "Invalid email or password."
                );
            }
        }

        // =====================================================
        // Successful login
        // =====================================================

        const user = result.data;

        const roleId = Number(
            user.role_id ??
            user.auth_role_id
        );

        if (![1, 2, 3, 4].includes(roleId)) {
            throw new Error(
                "Login successful, but user role could not be determined."
            );
        }

        // =====================================================
        // Save role against this email
        // =====================================================

        localStorage.setItem(
            roleStorageKey,
            String(roleId)
        );

        // =====================================================
        // Save authentication
        // =====================================================

        localStorage.setItem(
            "auth_user",
            JSON.stringify({
                user: user,
                token: user.auth_token,
            })
        );

        // =====================================================
        // Save activity
        // =====================================================

        localStorage.setItem(
            "lastActivity",
            String(Date.now())
        );

        // =====================================================
        // Redirect
        // =====================================================

        switch (roleId) {

            case 1:
                navigate(
                    "/super-admin/dashboard",
                    { replace: true }
                );
                break;

            case 2:
                navigate(
                    "/students/dashboard",
                    { replace: true }
                );
                break;

            case 3:
                navigate(
                    "/coordinator/dashboard",
                    { replace: true }
                );
                break;

            case 4:
                navigate(
                    "/company/dashboard",
                    { replace: true }
                );
                break;

            default:
                throw new Error(
                    "Unknown user role."
                );
        }

    } catch (error) {

        setError(
            error?.message ||
            "Unable to login."
        );

    } finally {

        setLoading(false);
    }
};

    /*
    |--------------------------------------------------------------------------
    | Forgot Password
    |--------------------------------------------------------------------------
    */

    const handleForgotPassword = () => {

        navigate("/forgot-password");
    };


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="w-full max-w-md">

                <div className="bg-white rounded-2xl shadow-lg p-8">

                    {/* Header */}

                    <div className="text-center mb-8">

                        <h1 className="text-2xl font-bold text-gray-900">
                            Sign In
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to your account
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                            {error}

                        </div>

                    )}


                    {/* Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Email */}

                        <div>

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                                disabled={loading}
                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>


                            <div className="relative">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            (previous) =>
                                                !previous
                                        )
                                    }
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* Forgot password */}

                        <div className="flex justify-end">

                            <button
                                type="button"
                                onClick={
                                    handleForgotPassword
                                }
                                disabled={loading}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                Forgot password?
                            </button>

                        </div>


                        {/* Login */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"}

                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}