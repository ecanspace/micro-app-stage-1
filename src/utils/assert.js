// 断言的含义：当程序执行到断言的位置时，对应的断言应该为真。若断言不为真时，程序会中止执行，并给出错误信息。

export const assertType = {
  // 期待类型
  expect(target, types) {
    let result, message;

    if (typeof types === 'string') {
      types = [types]
    }

    const targetType = typeof target

    result = types.includes(targetType)
    message = result ? 'Assertion passed' : `Expect to receive ${types} types, But received a(n) ${targetType}`

    return new Assertion('expect', result, message)
  }
}

// 每次断言创建一个断言结果对象
function Assertion(name, result, message) {
  this.name = name
  this.result = result
  this.message = message
}