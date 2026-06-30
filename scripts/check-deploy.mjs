const url = 'https://woaini-zhongguo.github.io/romantic_rituals/';

const res = await fetch(url);
const html = await res.text();

const jsMatch = html.match(/src="([^"]+\.js)"/);
const cssMatch = html.match(/href="([^"]+\.css)"/);

console.log('JS file:', jsMatch ? jsMatch[1] : 'not found');
console.log('CSS file:', cssMatch ? cssMatch[1] : 'not found');

if (jsMatch) {
  const jsUrl = new URL(jsMatch[1], url).href;
  const jsRes = await fetch(jsUrl);
  const js = await jsRes.text();
  console.log('JS size:', js.length, 'bytes');
  console.log('Has supabase URL:', js.includes('kgmhv'));
  console.log('Has render call:', js.includes('createRoot'));
  console.log('Has Login component:', js.includes('密码'));
  console.log('Has basename:', js.includes('romantic_rituals'));
}

if (cssMatch) {
  const cssUrl = new URL(cssMatch[1], url).href;
  const cssRes = await fetch(cssUrl);
  const css = await cssRes.text();
  console.log('CSS size:', css.length, 'bytes');
  console.log('CSS has min-h-screen:', css.includes('min-h-screen'));
  console.log('CSS has bg-gradient:', css.includes('bg-gradient'));
}
