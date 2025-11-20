import { Route, Routes } from "react-router-dom";
import UserCreateForm from "./UserCreateForm";
import UserEditForm from "./UserEditForm";
import UserList from "./UserList";

export default function UsersModule() {
  return (
    <Routes>
      <Route index element={<UserList />} />
      <Route path="create" element={<UserCreateForm />} />
      <Route path=":id" element={<UserEditForm />} />
    </Routes>
  );
}
