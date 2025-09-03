import { toast } from 'sonner';
import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { baseURL } from '@/lib/axios-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signinSchema, type SigninType } from '@/validators/auth.validator';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resendVerificationToken, signin, verifyEmail } from '@/lib/apis';
import { useUser } from '@/contexts/user.context';

export default function SignupPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();
  const { setUser } = useUser();
  const queryClient = useQueryClient();

  const form = useForm<SigninType>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate: signinMutate, isPending: isSigninPending } = useMutation({
    mutationFn: signin,
  });

  const { mutate: verifyEmailMutate, isPending: isVerifyPending } = useMutation(
    { mutationFn: verifyEmail }
  );

  const { mutate: resendOtpMutate } = useMutation({
    mutationFn: resendVerificationToken,
  });

  function onSubmit(values: SigninType) {
    signinMutate(values, {
      onSuccess: (result) => {
        toast.success(result.message);
        setOtpSent(true);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to login');
        setOtpSent(false);
      },
    });
  }

  function handleOtpSubmit() {
    verifyEmailMutate(
      { code: otp },
      {
        onSuccess: async (result) => {
          await queryClient.invalidateQueries({ queryKey: ['profile'] });
          navigate('/');
          toast.success(result.message || 'Email verified successfully');
        },
        onError: () => {
          toast.error('Verification failed, Invalid or Expired OTP');
        },
      }
    );
  }

  function handleResendOtp() {
    resendOtpMutate(undefined, {
      onSuccess: (result) => {
        toast.success(result.message || 'OTP resent to your email');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to resend OTP');
      },
    });
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
      <p className="mt-2 text-gray-500">Sign In to enjoy the feature of HD</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="Enter you email"
                      className="rounded-lg pr-10"
                      {...field}
                    />
                    <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!otpSent && (
            <Button type="submit" disabled={isSigninPending} className="w-full">
              {isSigninPending ? 'Sending...' : 'Get OTP'}
            </Button>
          )}
        </form>
      </Form>

      {otpSent && (
        <div className="mt-6 space-y-4 bg-">
          <label className="text-sm font-medium text-gray-700">OTP</label>
          <div className="flex flex-col gap-0 justify-start items-start">
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="rounded-lg"
            />
            <Button variant="link" onClick={handleResendOtp}>
              Resend OTP
            </Button>
          </div>
          <Button
            onClick={handleOtpSubmit}
            disabled={isVerifyPending}
            className="w-full"
          >
            {isVerifyPending ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </div>
      )}

      {!otpSent && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `${baseURL}/api/v1/auth/google`;
            }}
            className="w-full flex items-center gap-2"
          >
            <img src="google.png" alt="Google" className="h-5 w-5" />
            Sign In with Google
          </Button>
        </div>
      )}
      <p className="mt-6 text-center text-gray-600">
        Need an account??{' '}
        <Link to="/signup" className="text-blue-600 font-medium underline">
          Create One
        </Link>
      </p>
    </div>
  );
}
