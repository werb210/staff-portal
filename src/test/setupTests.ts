import { handlers } from "./msw/handlers"
import { server } from "./msw/server"

beforeAll(() => {
  server.listen()
  server.use(...handlers)
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
