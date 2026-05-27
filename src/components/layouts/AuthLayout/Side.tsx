import { cloneElement } from 'react'
import Logo from '@/components/template/Logo'
import { APP_NAME } from '@/constants/app.constant'
import type { CommonProps } from '@/@types/common'

interface SideProps extends CommonProps {
    content?: React.ReactNode
}

const Side = ({ children, content, ...rest }: SideProps) => {
    return (
        <div className="grid lg:grid-cols-5 h-full">
            <div
                className="lg:col-span-3 bg-no-repeat bg-cover py-6 px-16 flex-col justify-start gap-10 hidden lg:flex"
                style={{
                    //backgroundImage: `url('/img/others/auth-side-bg.jpg')`,
                    background: `#090046`
                }}
            >
                <Logo mode="dark" logoWidth={320} />
                <div>
                    {/* <div className="mb-6 flex items-center gap-4">
                        <Avatar
                            className="border-2 border-white"
                            shape="circle"
                            src="/img/avatars/thumb-10.jpg"
                        />
                        <div className="text-white">
                            <div className="font-semibold text-base">
                                Brittany Hale
                            </div>
                            <span className="opacity-80">CTO, Onward</span>
                        </div>
                    </div> */}
                    <p className="text-xl text-white opacity-80">
                        Your property data - one platform, insight and action plans.
                    </p>
                    <ul className="mt-4 space-y-2 text-white opacity-80 list-disc list-inside text-base">
                        <li>A data driven solution for home management, maintenance and upgrades.</li>
                        <li>Control the data and share with industry partners.</li>
                        <li>Improve energy performance, lower bills and increase property value.</li>
                    </ul>
                </div>
                <span className="text-white mt-auto">
                    Copyright &copy; {`${new Date().getFullYear()}`}{' '}
                    <span className="font-semibold">{`${APP_NAME}`}</span>{' '}
                </span>
            </div>
            <div className="lg:col-span-2 flex flex-col justify-start lg:justify-center items-center bg-white dark:bg-gray-800">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    <div className="mb-8">{content}</div>
                    {children
                        ? cloneElement(children as React.ReactElement, {
                              ...rest,
                          })
                        : null}
                </div>
            </div>
        </div>
    )
}

export default Side
