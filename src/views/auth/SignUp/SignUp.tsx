import SignUpForm from './SignUpForm'
import Logo from '@/components/template/Logo'

const SignUp = () => {
    return (
        <>
            <div className="flex justify-center items-center py-6 mb-8 -mx-8 lg:hidden" style={{ background: '#090046' }}>
                <Logo mode="dark" type="full" logoWidth={200} />
            </div>
            <div className="mb-8">
                <h3 className="mb-1">Sign Up</h3>
                <p>And lets get started with your free trial</p>
            </div>
            <SignUpForm disableSubmit={false} />
        </>
    )
}

export default SignUp
