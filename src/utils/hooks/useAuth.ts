import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import {
    setUser,
    signInSuccess,
    signOutSuccess,
    useAppSelector,
    useAppDispatch,
} from '@/store'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useNavigate } from 'react-router-dom'
import useQuery from './useQuery'
import type { SignInCredential, SignUpCredential } from '@/@types/auth'
import { supabase } from '@/superbaseClient'

type Status = 'success' | 'failed'

function useAuth() {
    const dispatch = useAppDispatch()

    const navigate = useNavigate()

    const query = useQuery()

    const { token, signedIn } = useAppSelector((state) => state.auth.session)

    const signIn = async (
        values: SignInCredential,
    ): Promise<
        | {
            status: Status
            message: string
        }
        | undefined
    > => {
        try {
            //const resp = await apiSignIn(values)
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.userName,
                password: values.password,
            });
            if (error) {
                return {
                    status: 'failed',
                    message: error?.message,
                }
            }
            if (data) {
                const token = data.session?.access_token
                if (token) {
                    dispatch(signInSuccess(token))
                }
                if (data.session?.user) {
                    dispatch(
                        setUser(
                            data.session.user
                        ),
                    )
                }
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl
                        ? redirectUrl
                        : appConfig.authenticatedEntryPath,
                )
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const signUp = async (values: SignUpCredential) => {
        try {
            //const resp = await apiSignUp(values)
            const { data, error } = await supabase.auth.signUp({
                'email': values.email,
                'password': values.password
            })
            if (error) {
                return {
                    status: 'failed',
                    message: error?.message,
                }
            }
            if (data) {
                const token = data.session?.access_token
                if (token) {
                    dispatch(signInSuccess(token))
                }
                if (data.session?.user) {
                    dispatch(
                        setUser(
                            data.session.user
                        ),
                    )
                }
                const redirectUrl = query.get(REDIRECT_URL_KEY)
                navigate(
                    redirectUrl
                        ? redirectUrl
                        : appConfig.authenticatedEntryPath,
                )
                return {
                    status: 'success',
                    message: '',
                }
            }
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        } catch (errors: any) {
            return {
                status: 'failed',
                message: errors?.response?.data?.message || errors.toString(),
            }
        }
    }

    const handleSignOut = () => {
        dispatch(signOutSuccess())
        dispatch(
            setUser({
                avatar: '',
                userName: '',
                email: '',
                authority: [],
            }),
        )
        navigate(appConfig.unAuthenticatedEntryPath)
    }

    const signOut = async () => {
        let data = await supabase.auth.signOut()
        handleSignOut()
    }

    return {
        authenticated: token && signedIn,
        signIn,
        signUp,
        signOut,
    }
}

export default useAuth
