import { makeAutoObservable } from "mobx";

export interface workshopInterface {
  isLoading: boolean;
  isLoggedIn: boolean;
  username: string;
}
export default class Workshop {
  state: workshopInterface;
  constructor() {
    this.state = {
      isLoading: false,
      isLoggedIn: false,
      username: localStorage.getItem("username") || '', // Initialize username
    };
    makeAutoObservable(this);
    this.checkAuth();
  }

  set isLoading(value: boolean) {
    this.state.isLoading = value;
  }

  set isLoggedIn(value: boolean) {
    this.state.isLoggedIn = value;
  }

  set username(value: string) {
    this.state.username = value;
  }

  async checkAuth() {
    await this.refreshToken();
    const username = localStorage.getItem("username");
    if (username) {
        this.username = username;
    }
  }

  async login(username: string, password: string) {
    try {
      this.isLoading = true;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/account/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", username); 
        this.isLoggedIn = true;
        this.username = username;
        return {
          success: true,
          message: "Login successful",
        };
      }
      return {
        success: false,
        message: data.Message,
      };
    } catch (error: any) {
      console.log(error, "error");
      return {
        success: false,
        message: error.message,
      };
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    try {
      this.isLoading = true;
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/account/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        localStorage.removeItem("authToken");
        this.state.isLoggedIn = false;
        this.username = '';
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }

  async refreshToken() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/account/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`,
          },
          credentials: "include",

        }
      );
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("authToken", data.token);
        this.isLoggedIn = true;
        this.username = data.username;
      }
    } catch (error) {
      console.log(error);
    }
  }
}

