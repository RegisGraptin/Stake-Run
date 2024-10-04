import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Header } from '../components/Header';

const Home: NextPage = () => {
  return (
    <div>
      <Header />

      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>

    </div>
  );
};

export default Home;
