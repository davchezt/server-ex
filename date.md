```html
<script>
```
```js
function calcLastPayment(start, numPayments) {
  if (typeof start == 'string') {
    start = stringToDate(start);
  }

  var end = new Date(+start);
  end.setDate(end.getDate() + --numPayments * 14)
  return end;
}

// Expect date in US format m/d/y
function stringToDate(s) {
  s = s.split(/\D/)
  return new Date(s[2], --s[0], (parseInt(s[1]) + 1))
}
```

```html
</script>
```

```html
<form>
 <table>
  <tr><td>Enter first payment date (m/d/y):
      <td><input name="start">
  <tr><td>Enter number of payments:
      <td><input name="numPayments">
  <tr><td colspan="2"><input type="button" value="Calc end date" onclick="
           this.form.end.value = calcLastPayment(this.form.start.value, this.form.numPayments.value)
           ">
  <tr><td>Last payment date:
      <td><input readonly name="end">
  <tr><td colspan="2"><input type="reset">
 </table>
</form>
```

```js
var now = new Date(); // Date 2019-01-23T05:43:50.059Z
now.setDate(now.getDate() + 2);
console.log(now); // Date 2019-01-25T05:43:50.059Z
now.setDate(now.getDate() - 4);
console.log(now); // Date 2019-01-21T05:43:50.059Z
```

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
> quote
-------
> quote

Markdown | Less | Pretty
--- | --- | ---
*Still* | `renders` | **nicely**
1 | 2 | 3