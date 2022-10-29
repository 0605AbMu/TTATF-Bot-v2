export default function PasswordChecker(password: string): boolean {
    let result = password.match(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm
    );
    return result == null ? false : true;
  }
  