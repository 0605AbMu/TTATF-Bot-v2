export class IncorrectLoginAndPassword extends Error {
  public constructor() {
    super("HEMIS tizimida bundan login yoki parolga ega kabinet mavjud emas!");
  }
}

export class StudentNotFoundError extends Error {
  public constructor() {
    super("Talaba ma'lumotlari HEMIS tizimidan topilmadi");
  }
}
