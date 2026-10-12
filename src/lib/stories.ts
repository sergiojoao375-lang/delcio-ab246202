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
  {
    id: "restaurante-nova-york",
    title: "Dinner in New York",
    titlePt: "O jantar em Nova Iorque",
    emoji: "🍽️",
    level: "Iniciante",
    start: "a",
    nodes: {
      a: {
        text: "It's your first night in New York. You are hungry and you find a small restaurant near the hotel. A waiter with a big smile says: \"Good evening! Table for one?\" You nod and sit down. He brings a menu as big as a newspaper.",
        pt: "Primeira noite em Nova Iorque. Entras num restaurante pequeno e o empregado traz-te um menu gigante.",
        choices: [
          { label: "Excuse me, what do you recommend?", pt: "Desculpe, o que recomenda?", next: "recommend" },
          { label: "Just order a burger and fries.", pt: "Pedir um hambúrguer com batatas fritas.", next: "burger" },
        ],
      },
      recommend: {
        text: "\"Ah, you asked the right person!\" he says. \"The salmon is fantastic today. Or the soup — my grandmother's recipe.\" You are not sure. He waits patiently.",
        pt: "Ele recomenda o salmão ou a sopa da avó dele, e espera com calma.",
        choices: [
          { label: "I'll have the salmon, please.", pt: "Quero o salmão, por favor.", next: "salmon" },
          { label: "The soup sounds delicious.", pt: "A sopa parece deliciosa.", next: "soup" },
        ],
      },
      burger: {
        text: "\"A burger and fries, please,\" you say. \"Excellent choice for your first night! How would you like it cooked?\" he asks. You remember a word from your English course.",
        pt: "Pedes um hambúrguer. Ele pergunta como o queres cozinhar.",
        choices: [
          { label: "Medium, please.", pt: "Ao ponto, por favor.", next: "medium" },
          { label: "Well done, please.", pt: "Bem passado, por favor.", next: "well" },
        ],
      },
      salmon: {
        text: "The salmon arrives with lemon and fresh vegetables. It is the best meal of your trip. When you pay, the waiter says: \"Come back tomorrow. I'll save you the best table.\" You smile all the way to the hotel.",
        pt: "O salmão está delicioso e o empregado promete guardar-te a melhor mesa para amanhã.",
        end: true,
      },
      soup: {
        text: "The soup is warm, creamy and full of flavour. \"Your grandmother is a great cook,\" you say. He laughs: \"Don't tell her that. She thinks her cooking is normal!\" You leave the restaurant with a happy heart and a full stomach.",
        pt: "A sopa é maravilhosa. Elogias a avó do empregado e saís do restaurante feliz e satisfeito.",
        end: true,
      },
      medium: {
        text: "\"Perfect,\" the waiter says. The burger is juicy and delicious. \"First time in New York?\" he asks. You talk a little, you practise your English, and he gives you a free dessert: \"Welcome to the city!\"",
        pt: "O hambúrguer está ótimo. Conversam um pouco e ele oferece-te uma sobremesa: «Bem-vindo à cidade!»",
        end: true,
      },
      well: {
        text: "\"Well done, coming right up!\" The burger is a little dry, but the fries are perfect. \"Next time, try it medium,\" the waiter smiles. \"In New York, we always have a next time.\"",
        pt: "O hambúrguer fica um pouco seco, mas ele sorri: «Da próxima vez, prova ao ponto.»",
        end: true,
      },
    },
  },
  {
    id: "perdido-na-cidade",
    title: "Lost in the big city",
    titlePt: "Perdido na grande cidade",
    emoji: "🗺️",
    level: "Iniciante",
    start: "a",
    nodes: {
      a: {
        text: "You come out of the underground station and everything looks different. Tall buildings, rain, a crowd of people with umbrellas. Your phone battery is at 2%. The hotel is somewhere near, but where? You see an elderly woman closing a flower shop.",
        pt: "Saís da estação e nada te parece familiar. A telemóvel tem 2% de bateria. Vês uma senhora a fechar uma florista.",
        choices: [
          { label: "Excuse me, could you help me? I'm lost.", pt: "Desculpe, pode ajudar-me? Estou perdido.", next: "help" },
          { label: "Try to find the way with the last 2% of battery.", pt: "Tentar encontrar o caminho com os últimos 2% de bateria.", next: "phone" },
        ],
      },
      phone: {
        text: "You open the map... and the phone dies. Black screen. Great. The flower lady is still there, arranging her last roses. She looks friendly.",
        pt: "A telemóvel desliga-se. A senhora da florista ainda está lá e parece simpática.",
        choices: [
          { label: "Now ask the lady for help.", pt: "Pedir ajuda à senhora.", next: "help" },
          { label: "Follow the crowd and hope for the best.", pt: "Seguir a multidão e esperar pela melhor.", next: "crowd" },
        ],
      },
      help: {
        text: "\"Of course, dear!\" she says. \"Which hotel?\" You show the name. \"Ah, that's just around the corner. Go straight, then turn left at the bakery with the red awning. You can't miss it.\" She even draws you a little map on a receipt.",
        pt: "Ela explica o caminho: em frente e à esquerda na pastelaria do toldo vermelho, e ainda te desenha um mapa.",
        choices: [
          { label: "Thank you so much! Have a lovely evening.", pt: "Muito obrigado! Tenha uma boa noite.", next: "thanks" },
          { label: "Thank you. And what is your favourite flower?", pt: "Obrigado. E qual é a flor preferida dela?", next: "flower" },
        ],
      },
      crowd: {
        text: "You follow the crowd for fifteen minutes. It's the wrong direction — the crowd is going to a concert. But wait: from here, you can see the hotel sign! Small victories count too.",
        pt: "Segues a multidão no caminho errado, mas de longe vês o letreiro do hotel. Vitória!",
        end: true,
      },
      thanks: {
        text: "\"You're welcome! Travellers who ask, arrive,\" she says with a wink. Two minutes later you are at the hotel door. Tomorrow you will tell this story to your teacher — in English, of course.",
        pt: "«Quem pergunta, chega», diz ela. Dois minutos depois, estás à porta do hotel.",
        end: true,
      },
      flower: {
        text: "She laughs. \"Roses. Always roses.\" She gives you one small rose: \"For the gentleman who asked nicely instead of staring at his phone.\" You walk to the hotel with a rose in your hand and a smile on your face.",
        pt: "Ela dá-te uma rosa: «Para o cavalheiro que pediu com educação.» Chegas ao hotel a sorrir.",
        end: true,
      },
    },
  },
  {
    id: "entrevista-trabalho",
    title: "The job interview",
    titlePt: "A entrevista de emprego",
    emoji: "🎯",
    level: "Intermédio",
    start: "a",
    nodes: {
      a: {
        text: "Today is the big day: your first job interview in English, at an international hotel. The receptionist calls your name. \"Please come in.\" The manager shakes your hand. \"Good morning. Tell me a little about yourself.\"",
        pt: "Dia grande: a tua primeira entrevista de emprego em inglês, num hotel internacional.",
        choices: [
          { label: "\"I'm hard-working and I love helping people.\"", pt: "«Sou trabalhadora e adoro ajudar as pessoas.»", next: "confident" },
          { label: "Speak too fast because you're nervous.", pt: "Falar rápido demais por causa dos nervos.", next: "nervous" },
        ],
      },
      confident: {
        text: "\"I'm hard-working and I love helping people,\" you say calmly. \"Last year I helped tourists in my town every summer.\" The manager writes something down. \"I like that. Tell me, what would you do if an angry guest complained?\"",
        pt: "Respondes com calma e ela pergunta o que farias se um hóspede zangado se queixasse.",
        choices: [
          { label: "\"I would listen first, then find a solution.\"", pt: "«Primeiro ouviria, depois procurava uma solução.»", next: "listen" },
          { label: "\"I would call my manager immediately.\"", pt: "«Chamava imediatamente o meu chefe.»", next: "manager" },
        ],
      },
      nervous: {
        text: "The words come out like a train. You realise it and stop. Take a breath. \"I'm sorry — I'm a little nervous. This job is important to me.\" The manager smiles: \"Honesty is a good quality too. Take your time.\"",
        pt: "Ficas nervoso, mas admite-o com honestidade. Ela sorri: «A honestidade também é uma boa qualidade.»",
        choices: [
          { label: "Start again, slowly.", pt: "Começar de novo, devagar.", next: "confident" },
          { label: "Ask for a glass of water first.", pt: "Pedir um copo de água primeiro.", next: "water" },
        ],
      },
      water: {
        text: "The water helps. You speak slowly, you smile, and the interview goes well. \"We'll call you next week,\" the manager says. As you leave, she adds: \"And congratulations — asking for water was smart. A person who takes care of themselves can take care of guests.\"",
        pt: "A água ajuda e a entrevista corre bem. Ela elogia a tua calma e promete ligar na próxima semana.",
        end: true,
      },
      listen: {
        text: "\"I would listen first, then find a solution,\" you answer. \"Perfect,\" she says. \"Guests want to feel heard before anything else.\" She stands up: \"You did very well today. We'll be in touch.\" You walk out tall, one step closer to your dream.",
        pt: "A tua resposta agrada-lhe muito. A entrevista termina com um sorriso e uma promessa de contacto.",
        end: true,
      },
      manager: {
        text: "\"I would call my manager,\" you say. She nods slowly. \"That works... but our best employees solve small problems themselves first. Think about that.\" The interview continues, a little harder than before.",
        pt: "Ela concorda meio relutante: os melhores colaboradores resolvem sozinhos os problemas pequenos.",
        choices: [
          { label: "\"I understand. Next time I would try to solve it first.\"", pt: "«Entendo. Da próxima vez tentaria resolver primeiro.»", next: "learned" },
          { label: "Stay quiet and hope the interview ends soon.", pt: "Ficar calado e esperar que acabe.", next: "quiet" },
        ],
      },
      learned: {
        text: "\"Now that's what I call learning fast,\" she says with a smile. \"Everyone makes mistakes. What matters is what you do with them.\" At the door, she shakes your hand again: \"Keep that attitude and you'll go far.\"",
        pt: "Ela sorri: «É assim que se aprende depressa.» Despede-se com um aperto de mão e palavras de encorajamento.",
        end: true,
      },
      quiet: {
        text: "The room is silent. Too silent. \"Do you have any questions for us?\" she finally asks. You don't. The interview ends politely, but you know you could have shown more. Next time, you will.",
        pt: "O silêncio pesa. A entrevista acaba, mas sabes que podias ter mostrado mais. Na próxima, vais conseguir.",
        end: true,
      },
    },
  },
];

export function getStory(id: string) {
  return STORIES.find((s) => s.id === id);
}
