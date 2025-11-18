<template>
  <div class="container mt-5">
    <h1 class="mb-4">Admin Panel</h1>

    <!-- Password Authentication -->
    <div v-if="!isAuthenticated" class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Admin Authentication</h5>
            <form @submit.prevent="authenticate">
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
              </div>
              <div v-if="authError" class="alert alert-danger">{{ authError }}</div>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Interface -->
    <div v-else>
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'users' }"
            @click="activeTab = 'users'"
            href="#"
          >
            Users
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'settings' }"
            @click="activeTab = 'settings'"
            href="#"
          >
            Settings
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link"
            :class="{ active: activeTab === 'drawings' }"
            @click="activeTab = 'drawings'"
            href="#"
          >
            Drawings
          </a>
        </li>
      </ul>

      <!-- Users Tab -->
      <div v-show="activeTab === 'users'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3>User Management</h3>
          <button class="btn btn-success" @click="showCreateUserModal">
            Create User
          </button>
        </div>

        <div v-if="loadingUsers" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="users.length === 0" class="alert alert-info">
          No users found.
        </div>

        <table v-else class="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Participation</th>
              <th>Exclusions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span :class="user.participation ? 'badge bg-success' : 'badge bg-secondary'">
                  {{ user.participation ? 'Yes' : 'No' }}
                </span>
              </td>
              <td>{{ user.exclusions?.length || 0 }}</td>
              <td>
                <button class="btn btn-sm btn-primary me-2" @click="editUser(user)">
                  Edit
                </button>
                <button class="btn btn-sm btn-danger" @click="deleteUser(user.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Settings Tab -->
      <div v-show="activeTab === 'settings'">
        <h3 class="mb-3">Application Settings</h3>

        <div v-if="loadingSettings" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <form v-else @submit.prevent="updateSettings">
          <div class="mb-3">
            <label for="drawingTime" class="form-label">Drawing Time</label>
            <input
              type="datetime-local"
              class="form-control"
              id="drawingTime"
              v-model="settingsForm.drawing_time"
            />
          </div>

          <div class="mb-3">
            <label for="assignmentHint" class="form-label">Assignment Hint Message</label>
            <textarea
              class="form-control"
              id="assignmentHint"
              rows="3"
              v-model="settingsForm.assignment_hint"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="retrySec" class="form-label">Retry Seconds (Rate Limit)</label>
            <input
              type="number"
              class="form-control"
              id="retrySec"
              v-model.number="settingsForm.retry_sec"
            />
          </div>

          <div v-if="settingsSuccess" class="alert alert-success">
            Settings updated successfully!
          </div>
          <div v-if="settingsError" class="alert alert-danger">
            {{ settingsError }}
          </div>

          <button type="submit" class="btn btn-primary">Update Settings</button>
        </form>
      </div>

      <!-- Drawings Tab -->
      <div v-show="activeTab === 'drawings'">
        <h3 class="mb-3">Current Drawings</h3>

        <div v-if="loadingDrawings" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="drawings.length === 0" class="alert alert-info">
          No drawings found. The drawing has not been performed yet.
        </div>

        <table v-else class="table table-striped">
          <thead>
            <tr>
              <th>Gift Giver</th>
              <th>Gift Receiver</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(drawing, index) in drawings" :key="index">
              <td>
                {{ drawing.donor.firstName }} {{ drawing.donor.lastName }}
                <br />
                <small class="text-muted">{{ drawing.donor.email }}</small>
              </td>
              <td>
                {{ drawing.donee.firstName }} {{ drawing.donee.lastName }}
                <br />
                <small class="text-muted">{{ drawing.donee.email }}</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- User Modal -->
    <div
      class="modal fade"
      id="userModal"
      tabindex="-1"
      aria-labelledby="userModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="userModalLabel">
              {{ editingUser ? 'Edit User' : 'Create User' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser">
              <div class="mb-3">
                <label for="firstName" class="form-label">First Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="firstName"
                  v-model="userForm.firstName"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="lastName" class="form-label">Last Name</label>
                <input
                  type="text"
                  class="form-control"
                  id="lastName"
                  v-model="userForm.lastName"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="userForm.email"
                  required
                />
              </div>

              <div class="mb-3 form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="participation"
                  v-model="userForm.participation"
                />
                <label class="form-check-label" for="participation">
                  Participating
                </label>
              </div>

              <div class="mb-3">
                <label for="exclusions" class="form-label">Exclusions (User IDs)</label>
                <select
                  multiple
                  class="form-select"
                  id="exclusions"
                  v-model="userForm.exclusions"
                  size="5"
                >
                  <option
                    v-for="user in availableUsersForExclusion"
                    :key="user.id"
                    :value="user.id"
                  >
                    {{ user.firstName }} {{ user.lastName }}
                  </option>
                </select>
                <small class="text-muted">Hold Ctrl/Cmd to select multiple</small>
              </div>

              <div v-if="userError" class="alert alert-danger">{{ userError }}</div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { API_BASEPATH } from '@/components/config';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  participation: boolean;
  exclusions?: string[];
}

interface Settings {
  drawing_time: string;
  assignment_hint?: string;
  retry_sec: number;
}

interface Drawing {
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  donee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default defineComponent({
  name: 'AdminPanel',
  data() {
    return {
      isAuthenticated: false,
      password: '',
      authToken: '',
      authError: '',
      activeTab: 'users',

      // Users
      users: [] as User[],
      loadingUsers: false,
      userForm: {
        firstName: '',
        lastName: '',
        email: '',
        participation: false,
        exclusions: [] as string[],
      },
      editingUser: null as User | null,
      userError: '',

      // Settings
      settingsForm: {
        drawing_time: '',
        assignment_hint: '',
        retry_sec: 5,
      } as Settings,
      loadingSettings: false,
      settingsSuccess: false,
      settingsError: '',

      // Drawings
      drawings: [] as Drawing[],
      loadingDrawings: false,
    };
  },
  computed: {
    availableUsersForExclusion(): User[] {
      if (this.editingUser) {
        return this.users.filter((u) => u.id !== this.editingUser!.id);
      }
      return this.users;
    },
  },
  methods: {
    async hashPassword(password: string): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    },

    async authenticate() {
      this.authError = '';
      try {
        // Hash the password before sending
        const hashedPassword = await this.hashPassword(this.password);
        this.authToken = hashedPassword;

        // Test the authentication by making a request to the auth endpoint
        await axios.post(
          `${API_BASEPATH}/admin/auth`,
          { passwordHash: hashedPassword },
          {
            headers: {
              Authorization: `Bearer ${hashedPassword}`,
            },
          }
        );

        this.isAuthenticated = true;
        this.loadUsers();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        this.authError = err.response?.data?.message || 'Invalid password';
      }
    },

    getAuthHeaders() {
      return {
        Authorization: `Bearer ${this.authToken}`,
      };
    },

    async loadUsers() {
      this.loadingUsers = true;
      try {
        const response = await axios.get(`${API_BASEPATH}/admin/users`, {
          headers: this.getAuthHeaders(),
        });
        this.users = response.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users:', error);
      } finally {
        this.loadingUsers = false;
      }
    },

    showCreateUserModal() {
      this.editingUser = null;
      this.userForm = {
        firstName: '',
        lastName: '',
        email: '',
        participation: false,
        exclusions: [],
      };
      this.userError = '';
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('userModal')
      );
      modal.show();
    },

    editUser(user: User) {
      this.editingUser = user;
      this.userForm = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        participation: user.participation,
        exclusions: user.exclusions || [],
      };
      this.userError = '';
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('userModal')
      );
      modal.show();
    },

    async saveUser() {
      this.userError = '';
      try {
        if (this.editingUser) {
          // Update existing user
          await axios.put(
            `${API_BASEPATH}/admin/users/${this.editingUser.id}`,
            this.userForm,
            {
              headers: this.getAuthHeaders(),
            }
          );
        } else {
          // Create new user
          await axios.post(`${API_BASEPATH}/admin/users`, this.userForm, {
            headers: this.getAuthHeaders(),
          });
        }

        // Close modal and reload users
        const modalElement = document.getElementById('userModal');
        interface WindowWithBootstrap extends Window {
          bootstrap?: {
            Modal: {
              getInstance: (element: HTMLElement | null) => { hide: () => void } | null;
            };
          };
        }
        const modal = (window as WindowWithBootstrap).bootstrap!.Modal.getInstance(modalElement);
        modal?.hide();
        await this.loadUsers();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        this.userError = err.response?.data?.message || 'Failed to save user';
      }
    },

    async deleteUser(userId: string) {
      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }

      try {
        await axios.delete(`${API_BASEPATH}/admin/users/${userId}`, {
          headers: this.getAuthHeaders(),
        });
        await this.loadUsers();
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } }; message?: string };
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    },

    async loadSettings() {
      this.loadingSettings = true;
      try {
        const response = await axios.get(`${API_BASEPATH}/admin/settings`, {
          headers: this.getAuthHeaders(),
        });
        const settings = response.data;

        // Convert date to datetime-local format
        const date = new Date(settings.drawing_time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const datetimeLocal = `${year}-${month}-${day}T${hours}:${minutes}`;

        this.settingsForm = {
          drawing_time: datetimeLocal,
          assignment_hint: settings.assignment_hint || '',
          retry_sec: settings.retry_sec || 5,
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load settings:', error);
      } finally {
        this.loadingSettings = false;
      }
    },

    async updateSettings() {
      this.settingsSuccess = false;
      this.settingsError = '';
      try {
        // Convert datetime-local to ISO string
        const drawingTime = new Date(this.settingsForm.drawing_time);

        await axios.put(
          `${API_BASEPATH}/admin/settings`,
          {
            drawing_time: drawingTime.toISOString(),
            assignment_hint: this.settingsForm.assignment_hint,
            retry_sec: this.settingsForm.retry_sec,
          },
          {
            headers: this.getAuthHeaders(),
          }
        );

        this.settingsSuccess = true;
        setTimeout(() => {
          this.settingsSuccess = false;
        }, 3000);
      } catch (error) {
        const err = error as { response?: { data?: { message?: string } } };
        this.settingsError =
          err.response?.data?.message || 'Failed to update settings';
      }
    },

    async loadDrawings() {
      this.loadingDrawings = true;
      try {
        const response = await axios.get(`${API_BASEPATH}/admin/assignments/details`, {
          headers: this.getAuthHeaders(),
        });
        this.drawings = response.data;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load drawings:', error);
      } finally {
        this.loadingDrawings = false;
      }
    },
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'users') {
        this.loadUsers();
      } else if (newTab === 'settings') {
        this.loadSettings();
      } else if (newTab === 'drawings') {
        this.loadDrawings();
      }
    },
  },
});
</script>

<style scoped>
.nav-link {
  cursor: pointer;
}
</style>
