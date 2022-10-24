export default class Queue<T> {
  private arr: T[] = [];
  public GetLength(): number {
    return this.arr.length;
  }
  public GetFirst() {
    return this.arr[0];
  }
  public Enqueue(data: T) {
    this.arr.push(data);
  }
  public Dequeue(): T | undefined {
    return this.arr.shift();
  }
  public GetAll(): T[] {
    return this.arr;
  }
}
