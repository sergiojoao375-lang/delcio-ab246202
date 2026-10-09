export type StoryChoice = { label: string; pt: string; next: string };
export type StoryNode = { text: string; pt: string; choices?: StoryChoice[]; end?: boolean };
export type Story = { id: string; title: string; titlePt: string; emoji: string; level: string; start: string; nodes: Record<string, StoryNode> };

export const STORIES: Story[] = [
  {
    id: "mala-perdida",
    title: "The lost suitcase",
    titlePt: "O mistério da mala perdida no aeroporto",
    emoji: "🧳",
    level: "Iniciante",
    start: "a",
    nodes: {
      a: {
        text: "You land in London after a long flight. You wait at the baggage belt. Bags go round and round. One by one, people take their bags and leave. Your red suitcase is not there.",
        pt: "Aterras em Londres depois de um voo longo. A tua mala vermelha não aparece.",
        choices: [
          { label: "Go to the lost luggage desk.", pt: "Ir ao balcão de bagagem perdida.", next: "desk" },
          { label: "Wait a little longer.", pt: "Esperar mais um pouco.", next: "wait" },
        ],
      },
      wait: {
        text: "You wait ten more minutes. The belt stops. A man next to you says: \"Excuse me, I think I have your suitcase. It looks just like mine!\" He is holding a red suitcase.",
        pt: "Um homem diz que acha que tem a tua mala — é igual à dele.",
        choices: [
          { label: "Can I see the name tag, please?", pt: "Posso ver a etiqueta com o nome?", next: "tag" },
          { label: "That's mine! Give it to me.", pt: "É minha! Dá-ma.", next: "rude" },
        ],
      },
      desk: {
        text: "A friendly woman smiles at you. \"Good afternoon. How can I help you?\" You explain the problem. \"Can you describe your suitcase?\" she asks.",
        pt: "Uma senhora simpática pergunta como é a tua mala.",
        choices: [
          { label: "It's big and red, with a yellow ribbon.", pt: "É grande e vermelha, com uma fita amarela.", next: "found" },
          { label: "It's... a normal suitcase.", pt: "É... uma mala normal.", next: "vague" },
        ],
      },
      vague: {
        text: "The woman laughs kindly. \"We have three hundred normal suitcases here! Can you tell me the colour and the size?\" You think for a second.",
        pt: "Ela ri-se: há trezentas malas normais! Precisa da cor e do tamanho.",
        choices: [{ label: "It's big and red, with a yellow ribbon.", pt: "É grande e vermelha, com uma fita amarela.", next: "found" }],
      },
      tag: {
        text: "The man turns the tag. It says your name! He laughs. \"I'm so sorry. Mine must still be on the plane.\" You both go to the lost luggage desk together, and you become friends.",
        pt: "A etiqueta tem o teu nome! Ele pede desculpa e ficam amigos.",
        end: true,
      },
      rude: {
        text: "The man frowns. \"Hey, calm down! Let's check the name tag first.\" The tag has your name. You feel a bit embarrassed. \"Sorry,\" you say. \"Thank you for your help.\" Politeness is always a good idea!",
        pt: "Ele pede calma. A mala é tua, mas ficas envergonhado. Ser educado é sempre boa ideia!",
        end: true,
      },
      found: {
        text: "She types on her computer. \"Good news! Your suitcase went to Paris by mistake. It will arrive at your hotel tonight.\" You say thank you and walk out into the London rain. Your adventure begins!",
        pt: "A mala foi para Paris por engano e chega ao hotel esta noite. A aventura começa!",
        end: true,
      },
    },
  },
  {
    id: "cafe-estranho",
    title: "A strange conversation at the café",
    titlePt: "Uma conversa estranha no café",
    emoji: "☕",
    level: "Iniciante",
    start: "a",
    nodes: {
      a: {
        text: "It's a sunny morning. You walk into a small café. An old man at the counter looks at you and says: \"You're late. I've been waiting for you.\" You have never seen him before.",
        pt: "Num café, um senhor idoso diz que estás atrasado e que te esperava. Nunca o viste.",
        choices: [
          { label: "I'm sorry, do I know you?", pt: "Desculpe, conheço-o?", next: "know" },
          { label: "Order a coffee and ignore him.", pt: "Pedir um café e ignorá-lo.", next: "ignore" },
        ],
      },
      ignore: {
        text: "\"One coffee, please,\" you say to the waiter. The old man smiles and slides a small envelope across the counter. \"For you,\" he whispers. \"Open it later.\"",
        pt: "Pedes um café. O senhor desliza um envelope para ti: «Abre mais tarde».",
        choices: [
          { label: "Open it now.", pt: "Abrir já.", next: "open" },
          { label: "What's inside?", pt: "O que tem dentro?", next: "inside" },
        ],
      },
      know: {
        text: "The man looks at you carefully. \"Oh! You're not Sarah. You have the same blue jacket.\" He laughs. \"My granddaughter is meeting me here. Would you like to sit down while I wait?\"",
        pt: "Ele confundiu-te com a neta Sarah, por causa do casaco azul. Convida-te a sentar.",
        choices: [
          { label: "Sure, I'd love to.", pt: "Claro, com muito gosto.", next: "sit" },
          { label: "Sorry, I'm in a hurry.", pt: "Desculpe, estou com pressa.", next: "hurry" },
        ],
      },
      inside: {
        text: "\"A ticket,\" he says. \"For tonight's concert. My granddaughter can't come.\" Then he sees your face. \"Oh dear — you're not Sarah, are you?\" You both laugh. He gives you the ticket anyway.",
        pt: "É um bilhete de concerto. Ele percebe que não és a neta, mas dá-to na mesma.",
        end: true,
      },
      open: {
        text: "Inside there's a concert ticket and a note: \"Happy birthday, Sarah!\" You look up. \"I think this is for someone else,\" you say. Just then, a young woman in a blue jacket walks in. Mystery solved!",
        pt: "Um bilhete e um bilhete: «Feliz aniversário, Sarah!». A verdadeira Sarah chega. Mistério resolvido!",
        end: true,
      },
      sit: {
        text: "You sit and talk about the weather, music and his years as a sailor. When Sarah arrives, he says: \"This is my new friend.\" Sometimes the best conversations start by mistake.",
        pt: "Conversam sobre o tempo, música e as viagens dele no mar. Às vezes as melhores conversas começam por engano.",
        end: true,
      },
      hurry: {
        text: "\"No problem,\" he says. \"Have a lovely day!\" As you leave, you see a young woman in a blue jacket — just like yours. She waves at the old man. You smile all the way to work.",
        pt: "Ele deseja-te bom dia. À saída vês a neta com um casaco igual ao teu.",
        end: true,
      },
    },
  },
];

export function getStory(id: string) {
  return STORIES.find((s) => s.id === id);
}
