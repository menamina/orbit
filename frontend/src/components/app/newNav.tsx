function NewNav() {
  const [openTab, setOpenTab] = useState<boolean>(false);

  return (
    <div>
      <div>Mena</div>
      <button onClick={() => setOpenTab((prev: boolean) => !prev)}>
        <img src="" alt="" />
      </button>
    </div>
  );
}

export default NewNav;
