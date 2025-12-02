export default function asyncHandler(fn: any) {
  return function wrapped(req: any, res: any, next: any) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
