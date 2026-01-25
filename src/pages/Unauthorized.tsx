import AccessRestricted from "@/components/auth/AccessRestricted";

const UnauthorizedPage = () => <AccessRestricted message="You are not authorized to access this page." />;

export default UnauthorizedPage;
