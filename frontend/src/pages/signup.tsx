import { signupSchema, type SignupType } from '@/validators/auth.validator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resendVerificationToken, signup, verifyEmail } from '@/lib/apis';
import { toast } from 'sonner';
import { useState } from 'react';
import { baseURL } from '@/lib/axios-client';

export default function SignupPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const navigate = useNavigate();

  const form = useForm<SignupType>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      dob: '',
    },
  });

  const { mutate: signupMutate, isPending: isSignupPending } = useMutation({
    mutationFn: signup,
  });

  const { mutate: verifyEmailMutate, isPending: isVerifyPending } = useMutation(
    { mutationFn: verifyEmail }
  );

  const { mutate: resendOtpMutate } = useMutation({
    mutationFn: resendVerificationToken,
  });

  function onSubmit(values: SignupType) {
    signupMutate(values, {
      onSuccess: (result) => {
        toast.success(result.message);
        setOtpSent(true);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to register user');
        setOtpSent(false);
      },
    });
  }

  function handleOtpSubmit() {
    verifyEmailMutate(
      { code: otp },
      {
        onSuccess: (result) => {
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
      <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
      <p className="mt-2 text-gray-500">Sign up to enjoy the feature of HD</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter name"
                    className="rounded-lg"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="date"
                      className="rounded-lg pr-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                      placeholder="Enter email"
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
            <Button type="submit" disabled={isSignupPending} className="w-full">
              {isSignupPending ? 'Sending...' : 'Get OTP'}
            </Button>
          )}
        </form>
      </Form>

      {otpSent && (
        <div className="mt-6 space-y-4">
          <label className="text-sm font-medium text-gray-700">OTP</label>
          <div>
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
            Sign up with Google
          </Button>
        </div>
      )}
      <p className="mt-6 text-center text-gray-600">
        Already have an account??{' '}
        <Link
          to="/signin"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
