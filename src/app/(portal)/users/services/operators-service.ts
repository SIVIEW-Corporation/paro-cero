import { apiClient } from '@/lib/api-client';
import type { ApiClientOptions } from '@/lib/api-client';
import type { NewUserSchema } from '../lib/new-user-schema';
import type { EditUserSchema } from '../lib/edit-user-schema';
import type { User } from '@/store/auth-store';
import { APP_ROLES } from '@/features/technician/access';

type SessionRequestOptions = Pick<ApiClientOptions, 'isRequestCurrent'>;

export interface PaginatedUsersResponse {
  items: User[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UsersListFilters {
  companyId?: string | null;
}

/** Query string for `GET /users/`; `company_id` only when a company is set. */
export function buildUsersListQuery(
  page: number,
  size: number,
  { companyId }: UsersListFilters = {},
): string {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  params.set('include_inactive', 'false');
  if (companyId) params.set('company_id', companyId);
  return params.toString();
}

/** Transforms camelCase form values to the snake_case API body. */
export function buildNewUserBody(values: NewUserSchema) {
  return {
    email: values.email,
    password: values.password,
    full_name: values.fullName,
    role: values.role,
    company_id: values.companyId,
    area: values.area,
    job_title: values.jobTitle,
  };
}

/** The superadmin always creates users for an explicitly selected company. */
function assertCompanySelected(values: NewUserSchema): void {
  if (!values.companyId) {
    throw new Error('Selecciona una empresa para el usuario.');
  }
}

async function postNewUser(
  endpoint: string,
  body: ReturnType<typeof buildNewUserBody>,
  options: SessionRequestOptions,
): Promise<User> {
  const response = await apiClient.post<User>(endpoint, body, options);

  if (!response.ok) {
    throw new Error(response.error?.message || 'Error al crear usuario');
  }

  return response.data as User;
}

export const operatorsService = {
  /**
   * Create a user, routing by role: Supervisor (`admin`) through the admin
   * endpoint; Operador and Visor through the operator-viewer endpoint. Any
   * other role is rejected locally and never reaches the API.
   */
  createUser: (
    values: NewUserSchema,
    options: SessionRequestOptions = {},
  ): Promise<User> => {
    if (values.role === APP_ROLES.ADMIN)
      return operatorsService.createAdmin(values, options);
    if (values.role === APP_ROLES.OPERATOR || values.role === APP_ROLES.VIEWER)
      return operatorsService.createOperator(values, options);
    return Promise.reject(new Error('Rol de usuario no permitido.'));
  },

  /** Create a Supervisor (`admin`) for the selected company. */
  createAdmin: async (
    values: NewUserSchema,
    options: SessionRequestOptions = {},
  ): Promise<User> => {
    assertCompanySelected(values);
    return postNewUser(
      '/users/admin',
      { ...buildNewUserBody(values), role: APP_ROLES.ADMIN },
      options,
    );
  },

  /** Create an Operador or Visor for the selected company. */
  createOperator: async (
    values: NewUserSchema,
    options: SessionRequestOptions = {},
  ): Promise<User> => {
    if (
      values.role !== APP_ROLES.OPERATOR &&
      values.role !== APP_ROLES.VIEWER
    ) {
      throw new Error('Solo se crean operadores o visores con este flujo.');
    }
    assertCompanySelected(values);
    return postNewUser(
      '/users/operator-viewer',
      buildNewUserBody(values),
      options,
    );
  },

  /**
   * Paginated active users (superadmin only). `filters.companyId` narrows the
   * list to one company; null/undefined lists every company.
   */
  getOperators: async (
    page: number,
    size: number,
    filters: UsersListFilters = {},
    options: SessionRequestOptions = {},
  ): Promise<PaginatedUsersResponse> => {
    const response = await apiClient.get<PaginatedUsersResponse>(
      `/users/?${buildUsersListQuery(page, size, filters)}`,
      options,
    );

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al traer usuarios');
    }

    return response.data as PaginatedUsersResponse;
  },

  /**
   * Partially update an existing user by ID via PATCH.
   * Transforms camelCase fields to snake_case for API compatibility.
   * Only includes fields that have values (not undefined and not empty strings).
   */
  updateOperator: async (
    id: string,
    values: EditUserSchema,
    options: SessionRequestOptions = {},
  ): Promise<User> => {
    const body: Record<string, unknown> = {};

    if (values.email !== undefined && values.email !== '')
      body.email = values.email;
    if (values.fullName !== undefined && values.fullName !== '')
      body.full_name = values.fullName;
    if (values.role !== undefined) body.role = values.role;
    if (values.area !== undefined && values.area !== '')
      body.area = values.area;
    if (values.jobTitle !== undefined && values.jobTitle !== '')
      body.job_title = values.jobTitle;
    if (values.profileImage !== undefined && values.profileImage !== '')
      body.profile_image = values.profileImage;
    if (values.password !== undefined && values.password !== '')
      body.password = values.password;

    const response = await apiClient.patch<User>(`/users/${id}`, body, options);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al actualizar usuario');
    }

    return response.data as User;
  },

  /**
   * Delete an operator/viewer user by ID.
   */
  deleteOperator: async (
    id: string,
    options: SessionRequestOptions = {},
  ): Promise<void> => {
    const response = await apiClient.delete(`/users/${id}`, options);

    if (!response.ok) {
      throw new Error(response.error?.message || 'Error al eliminar usuario');
    }
  },
};
