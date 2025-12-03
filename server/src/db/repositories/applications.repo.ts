export type Application = Record<string, any> & { id?: string };

const sampleApplication: Application = { id: "application-1" };

const applicationsRepo = {
  async findMany(): Promise<Application[]> {
    return [sampleApplication];
  },
};

export default applicationsRepo;
export { applicationsRepo };
