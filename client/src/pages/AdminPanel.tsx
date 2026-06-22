/**
 * Admin Panel — Manage Hero Video, Card Stack, Stores Grid, Footer, and Sliders
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import AdminSliders from '@/components/AdminSliders';

interface CardItem {
  id: number;
  title: string;
  link: string;
  order: number;
  active: boolean;
}

interface StoreItem {
  id: number;
  name: string;
  logo: string;
  order: number;
  active: boolean;
}

export default function AdminPanel() {
  const [heroTitle, setHeroTitle] = useState('DESTOCKAGE EUROPE ••');
  const [heroButtonText, setHeroButtonText] = useState('DÉCOUVRIR ••');
  const [heroButtonLink, setHeroButtonLink] = useState('/arrivage');
  const [heroActive, setHeroActive] = useState(true);

  const [cards, setCards] = useState<CardItem[]>([
    { id: 1, title: 'Arrivage Europe ••', link: '/arrivage', order: 1, active: true },
    { id: 2, title: 'Bysis Garantie ••', link: '/garantie', order: 2, active: true },
    { id: 3, title: 'Wifi Dinar ••', link: '/wifidinar', order: 3, active: true },
    { id: 4, title: 'Livraison 48H ••', link: '/livraison', order: 4, active: true },
  ]);

  const [stores, setStores] = useState<StoreItem[]>([
    { id: 1, name: 'SHEIN', logo: '🛍️', order: 1, active: true },
    { id: 2, name: 'Amazon', logo: '📦', order: 2, active: true },
    { id: 3, name: 'Zara', logo: '👗', order: 3, active: true },
    { id: 4, name: 'Nike', logo: '👟', order: 4, active: true },
    { id: 5, name: 'H&M', logo: '🎽', order: 5, active: true },
    { id: 6, name: 'Pieuvre', logo: '🐙', order: 6, active: true },
  ]);

  const [footerCol1, setFooterCol1] = useState({ title: 'BYSIS ••', links: ['من نحن ••', 'Pieuvre SAS ••'] });
  const [footerCol2, setFooterCol2] = useState({ title: 'الامان ••', links: ['سياسة الخصوصية ••', 'Bysis Garantie ••'] });
  const [footerCol3, setFooterCol3] = useState({ title: 'تواصل ••', links: ['support@bysis.shop', 'لمطة، المنستير ••'] });

  // Card Management
  const updateCard = (id: number, field: string, value: any) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const deleteCard = (id: number) => {
    setCards(cards.filter((c) => c.id !== id));
  };

  const moveCard = (id: number, direction: 'up' | 'down') => {
    const index = cards.findIndex((c) => c.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < cards.length - 1)) {
      const newCards = [...cards];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      [newCards[index].order, newCards[swapIndex].order] = [newCards[swapIndex].order, newCards[index].order];
      setCards(newCards.sort((a, b) => a.order - b.order));
    }
  };

  // Store Management
  const updateStore = (id: number, field: string, value: any) => {
    setStores(stores.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const deleteStore = (id: number) => {
    setStores(stores.filter((s) => s.id !== id));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-8">Admin Panel ••</h1>

      <Tabs defaultValue="sliders" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sliders">Sliders</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        {/* SLIDERS TAB */}
        <TabsContent value="sliders" className="space-y-6">
          <AdminSliders />
        </TabsContent>

        {/* HERO VIDEO SECTION */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Video Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Activer cette section</label>
                <Switch checked={heroActive} onCheckedChange={setHeroActive} />
              </div>

              <div>
                <label className="text-sm font-medium">Titre H1</label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Texte du bouton</label>
                <Input value={heroButtonText} onChange={(e) => setHeroButtonText(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Lien du bouton</label>
                <Input value={heroButtonLink} onChange={(e) => setHeroButtonLink(e.target.value)} />
              </div>

              <div>
                <label className="text-sm font-medium">Remonter vidéo MP4</label>
                <Input type="file" accept="video/mp4" />
              </div>

              <Button className="w-full">Enregistrer les modifications ••</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CARD STACK SECTION */}
        <TabsContent value="cards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Card Stack (4 Karts)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Kart {card.order}: {card.title}</span>
                    <Switch checked={card.active} onCheckedChange={(val) => updateCard(card.id, 'active', val)} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Titre</label>
                    <Input value={card.title} onChange={(e) => updateCard(card.id, 'title', e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Lien</label>
                    <Input value={card.link} onChange={(e) => updateCard(card.id, 'link', e.target.value)} />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Remonter vidéo MP4</label>
                    <Input type="file" accept="video/mp4" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveCard(card.id, 'up')}
                      disabled={card.order === 1}
                    >
                      <ChevronUp size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveCard(card.id, 'down')}
                      disabled={card.order === cards.length}
                    >
                      <ChevronDown size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCard(card.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full">+ Ajouter un nouveau kart ••</Button>
              <Button className="w-full">Enregistrer les modifications ••</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STORES GRID SECTION */}
        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grid Magasins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {stores.map((store) => (
                  <div key={store.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{store.logo}</span>
                      <Switch checked={store.active} onCheckedChange={(val) => updateStore(store.id, 'active', val)} />
                    </div>
                    <Input value={store.name} onChange={(e) => updateStore(store.id, 'name', e.target.value)} />
                    <Input type="file" accept="image/png" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => deleteStore(store.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full">+ Ajouter un magasin ••</Button>
              <Button className="w-full">Enregistrer les modifications ••</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOOTER SECTION */}
        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Footer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Column 1 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre Colonne 1</label>
                  <Input value={footerCol1.title} onChange={(e) => setFooterCol1({ ...footerCol1, title: e.target.value })} />
                  {footerCol1.links.map((link, idx) => (
                    <Input
                      key={idx}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...footerCol1.links];
                        newLinks[idx] = e.target.value;
                        setFooterCol1({ ...footerCol1, links: newLinks });
                      }}
                    />
                  ))}
                </div>

                {/* Column 2 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre Colonne 2</label>
                  <Input value={footerCol2.title} onChange={(e) => setFooterCol2({ ...footerCol2, title: e.target.value })} />
                  {footerCol2.links.map((link, idx) => (
                    <Input
                      key={idx}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...footerCol2.links];
                        newLinks[idx] = e.target.value;
                        setFooterCol2({ ...footerCol2, links: newLinks });
                      }}
                    />
                  ))}
                </div>

                {/* Column 3 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Titre Colonne 3</label>
                  <Input value={footerCol3.title} onChange={(e) => setFooterCol3({ ...footerCol3, title: e.target.value })} />
                  {footerCol3.links.map((link, idx) => (
                    <Input
                      key={idx}
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...footerCol3.links];
                        newLinks[idx] = e.target.value;
                        setFooterCol3({ ...footerCol3, links: newLinks });
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button className="w-full">Enregistrer les modifications ••</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
