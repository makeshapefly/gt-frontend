import SignInForm from './SignInForm'
import Logo from '@/components/template/Logo'

const SignIn = () => {
    return (
        <>
            <div className="flex justify-center items-center py-6 mb-8 -mx-8 lg:hidden" style={{ background: '#090046' }}>
                <Logo mode="dark" type="full" logoWidth={200} />
            </div>
            <div className="mb-8">
                <h3 className="mb-1">Welcome back!</h3>
                <p>Please enter your credentials to sign in!</p>
            </div>
            <SignInForm disableSubmit={false} />
        </>
    )
}

export default SignIn
