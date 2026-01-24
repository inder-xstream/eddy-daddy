import { redirect } from 'next/navigation';

export default async function SignInPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const callbackUrl = searchParams?.callbackUrl;
  
  if (callbackUrl) {
    redirect(`/?auth=signin&callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  
  redirect('/?auth=signin');
}

