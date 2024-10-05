import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const Home: NextPage = () => {
  return (
    <div>
      <Header />

      <div
        className="relative overflow-hidden rounded-lg bg-cover bg-no-repeat p-12 text-center"
        style={{
          backgroundImage: "url('/images/image_2.jpg')",
          height: "100vh"
        }}>
        <div
          className="absolute bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-fixed"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)"
          }}>
          <div className="flex h-full items-center justify-center">
            <div className="text-white">
              <h2 className="mb-4 text-4xl font-semibold">
                Stake and Run
              </h2>
              <h4 className="mb-6 text-xl font-semibold">
                Put your money on the line and run
              </h4>
              <a
                href='https://t.me/StakeRunBot'
                type="button"
                className="rounded border-2 border-neutral-50 px-7 pb-[8px] pt-[10px] text-sm font-medium uppercase leading-normal text-neutral-50 transition duration-150 ease-in-out hover:border-neutral-100 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-neutral-100 focus:border-neutral-100 focus:text-neutral-100 focus:outline-none focus:ring-0 active:border-neutral-200 active:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
                data-twe-ripple-init
                data-twe-ripple-color="light">
                Try on Telegram
              </a>
            </div>
          </div>
        </div>
      </div>



      <section className="bg-white lg:pt-40 lg:pb-20 xl:pt-40 xl:pb-32">
        <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">

          <div className="grid mt-6">
            <img className='rounded-lg' src="/images/image_1.jpg" />
          </div>

          <div className="font-light text-gray-500 sm:text-lg">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">
              Struggling to stay motivated on your fitness journey?
            </h2>
            <p className="mb-4">
            Join the 30-day running challenge with Stake & Run—the perfect blend of fitness, motivation, and rewards, all powered by crypto.
            </p>

            <hr />

            <p className="mb-4 pt-4">
              
            </p>
          </div>

        </div>
      </section>



      <section className="bg-white lg:pt-40 lg:pb-20 xl:pt-40 xl:pb-32">
        <div className="gap-16 items-center py-8 px-4 mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 lg:py-16 lg:px-6">

          <div className="font-light text-gray-500 sm:text-lg">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-gray-900">
            Ready to take on the challenge? Try out our Telegram bot today! 

            </h2>
            <p className="mb-4">
              


            </p>

            <hr />

            <p className="mb-4 pt-4">
            With Stake & Run, reaching your fitness goals is not only fun but rewarding. Stake your ETH, join the challenge, and let our AI coach keep you on track. Simply run, upload your screenshot, earn back your stake and win rewards. Whether you're training for a marathon or just staying fit, we've made it easy.
            </p>
          </div>

          <div className="grid mt-6">
            <img className='rounded-lg' src="/images/image_1.jpg" />
          </div>

        </div>
      </section>

      <Footer />


    </div>
  );
};

export default Home;
