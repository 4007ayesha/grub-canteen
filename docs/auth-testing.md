# Authentication Testing

## Registration
- [ ] Student registration works
- [ ] Duplicate email is rejected
- [ ] Password is stored as a hash

## Login
- [ ] Student can login
- [ ] Admin can login
- [ ] Wrong password returns 401
- [ ] Unknown email returns 401

## JWT
- [ ] Successful login returns JWT
- [ ] JWT contains user ID
- [ ] JWT contains role
- [ ] Expired/invalid JWT is rejected

## Authorization
- [ ] Student can access student routes
- [ ] Student cannot access admin routes
- [ ] Admin can access admin routes

## Security
- [ ] Plain-text passwords are never stored
- [ ] Password is never returned by API