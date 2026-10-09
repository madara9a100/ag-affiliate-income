
"use strict";

// Replace these two values with your own Supabase project details.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const client = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const $ = (id) => document.getElementById(id);

const authPanel = $("auth-panel");
const dashboard = $("dashboard");
const message = $("message");
const forms = [
  "login-form",
  "register-form",
  "forgot-form",
  "reset-form"
];

let busy = false;

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function showForm(formId) {
  forms.forEach((id) => {
    $(id).hidden = id !== formId;
  });

  $("login-tab").classList.toggle("active", formId === "login-form");
  $("register-tab").classList.toggle("active", formId === "register-form");

  showMessage("");
}

function showDashboard(user) {
  authPanel.hidden = true;
  dashboard.hidden = false;
  $("user-name").textContent =
    user.user_metadata?.full_name || "Member";
  $("user-email").textContent = user.email || "Not available";
  $("user-id").textContent = user.id;
}

function showAuthentication() {
  dashboard.hidden = true;
  authPanel.hidden = false;
}

function readableError(error) {
  const text = String(error?.message || "Something went wrong.");

  if (/invalid login credentials/i.test(text)) {
    return "Email or password is incorrect.";
  }
  if (/email not confirmed/i.test(text)) {
    return "Please verify your email using the confirmation link.";
  }
  if (/password should be at least/i.test(text)) {
    return "Choose a longer password.";
  }

  return text;
}

async function withBusy(button, action) {
  if (busy) return;

  busy = true;
  const oldText = button.textContent;
  button.disabled = true;
  button.textContent = "Please wait...";

  try {
    await action();
  } catch (error) {
    showMessage(readableError(error), "error");
  } finally {
    busy = false;
    button.disabled = false;
    button.textContent = oldText;
  }
}

$("login-tab").addEventListener("click", () => showForm("login-form"));
$("register-tab").addEventListener("click", () => showForm("register-form"));
$("forgot-link").addEventListener("click", () => showForm("forgot-form"));

document.querySelectorAll(".back-login").forEach((button) => {
  button.addEventListener("click", () => showForm("login-form"));
});

$("register-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = $("reg-name").value.trim();
  const email = $("reg-email").value.trim();
  const password = $("reg-password").value;
  const confirm = $("reg-confirm").value;
  const button = event.submitter;

  if (password !== confirm) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    return;
  }

  await withBusy(button, async () => {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin +
          window.location.pathname
      }
    });

    if (error) throw error;

    if (data.session) {
      showMessage("Account created successfully.", "success");
    } else {
      showMessage(
        "Registration received. Check your email and click the confirmation link before logging in.",
        "success"
      );
      $("register-form").reset();
    }
  });
});

$("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  const button = event.submitter;

  await withBusy(button, async () => {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.user) showDashboard(data.user);
  });
});

$("forgot-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("forgot-email").value.trim();
  const button = event.submitter;

  await withBusy(button, async () => {
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) throw error;

    showMessage(
      "If an account exists for that email, a reset link will be sent. Check your inbox.",
      "success"
    );
  });
});

$("reset-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = $("new-password").value;
  const confirm = $("new-confirm").value;
  const button = event.submitter;

  if (password !== confirm) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  await withBusy(button, async () => {
    const { error } = await client.auth.updateUser({ password });
    if (error) throw error;

    showMessage("Password updated. You can now log in.", "success");
    await client.auth.signOut();
    showForm("login-form");
    showMessage("Password updated. Please log in.", "success");
  });
});

$("logout-button").addEventListener("click", async () => {
  const { error } = await client.auth.signOut();

  if (error) {
    showMessage(readableError(error), "error");
    return;
  }

  showAuthentication();
  showForm("login-form");
  showMessage("You have logged out.", "success");
});

// Password recovery links return to this page with a recovery session.
client.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    showAuthentication();
    showForm("reset-form");
    showMessage("Enter and confirm your new password.", "success");
    return;
  }

  if (session?.user) {
    showDashboard(session.user);
  } else {
    showAuthentication();
  }
});

// Restore an existing login session when the page opens.
(async function init() {
  showAuthentication();

  if (
    SUPABASE_URL.includes("YOUR_SUPABASE") ||
    SUPABASE_PUBLISHABLE_KEY.includes("YOUR_SUPABASE")
  ) {
    showForm("login-form");
    showMessage(
      "Setup required: add your Supabase URL and Publishable key in script.js.",
      "error"
    );
    return;
  }

  const { data, error } = await client.auth.getSession();

  if (error) {
    showMessage(readableError(error), "error");
    return;
  }

  if (data.session?.user) {
    showDashboard(data.session.user);
  } else {
    showForm("login-form");
  }
})();
