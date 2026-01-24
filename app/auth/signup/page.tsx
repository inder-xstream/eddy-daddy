import { redirect } from 'next/navigation';

export default async function SignUpPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;

  if (callbackUrl) {
    redirect(`/?auth=signup&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  redirect('/?auth=signup');
}
