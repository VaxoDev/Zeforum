"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/components/AuthProvider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  Users,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Award,
  Target,
  Shield,
  HelpCircle,
  Globe,
  HeartHandshake,
  LampDesk,
} from "lucide-react"

export default function Home() {
  const { user } = useAuthContext()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16 text-center"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-6">მოგესალმებით ZeForum-ზე</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          გააზიარეთ თქვენი იდეები და მოსაზრებები ჩვენი ქალაქის შესახებ
        </p>
        <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden"></div>
        {!user && (
          <Link href="/login">
            <Button size="lg" className="animate-bounce">
              შემოგვიერთდით დღესვე
            </Button>
          </Link>
        )}
      </motion.section>

      {/* About Zeforum Project Section */}
      <section className="container mx-auto px-4 py-16 bg-background text-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">ჩვენი მისია</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Globe className="w-8 h-8 mt-1 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">ლოკალური გადაწყვეტილებები</h3>
                  <p className="text-muted-foreground">
                    ჩვენ ვქმნით პლატფორმას სადაც ყველა მოქალაქეს შეუძლია წამოაყენოს იდეები თუ როგორ გახდეს ჩვენი ქალაქი უკეთესი ადგილი
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <HeartHandshake className="w-8 h-8 mt-1 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">საზოგადოებრივი ჩართულობა</h3>
                  <p className="text-muted-foreground">
                    ჩვენ გვჯერა, რომ ცვლილება იწყება საზოგადოების აქტიური მონაწილეობით
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <LampDesk className="w-8 h-8 mt-1 text-primary" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">ახალგაზრდული ინიციატივები</h3>
                  <p className="text-muted-foreground">
                    სკოლის მოსწავლეებს გვაქვს უნიკალური შესაძლებლობა გამოვხატოთ ჩვენი შეხედულებები
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-lg text-foreground">
                ZeForum არის ინოვაციური სასკოლო პროექტი, რომელიც შეიქმნა იმისთვის, რომ გააძლიეროს მოქალაქეების ხმა და ხელი
                შეუწყოს საზოგადოებრივ ჩართულობას ჩვენს ქალაქში.
              </p>
              <p className="text-lg text-foreground">
                ჩვენი პლატფორმა აკავშირებს სკოლის მოსწავლეებს, მასწავლებლებს და ადგილობრივ მოსახლეობას საერთო მიზნებისთვის
                თანამშრომლობისთვის. ყოველი წარმოდგენილი იდეა გადის კოლექტიურ დახვეწას და შესაძლებელია რეალიზება
                ადგილობრივი ხელისუფლების მხარდაჭერით.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Key Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">ZeForum-ის უპირატესობები</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Lightbulb className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">ინოვაციური იდეები</h3>
            <p className="text-muted-foreground">წამოაყენეთ და განიხილეთ ახალი იდეები ქალაქის გაუმჯობესებისთვის</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Users className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">თანამშრომლობა</h3>
            <p className="text-muted-foreground">იმუშავეთ ერთად სხვა მოქალაქეებთან საერთო მიზნების მისაღწევად</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="p-6 rounded-lg bg-card">
            <Target className="w-12 h-12 mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">რეალური ზეგავლენა</h3>
            <p className="text-muted-foreground">მიიღეთ მონაწილეობა დისკუსიებში, რომლებიც რეალურ ცვლილებებს იწვევს</p>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-background text-foreground">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">როგორ მუშაობს ZeForum</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <BookOpen className="w-6 h-6 mr-2" />
                იდეების გაზიარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                წაიკითხეთ პოსტები სხვადასხვა პრობლემის შესახებ, რომელიც გსურთ რომ გადაიჭრას. გახდით აქტიური მოქალაქე და
                ჩაერთეთ სხვადასხვა ღონისძიებებში.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageSquare className="w-6 h-6 mr-2" />
                დისკუსია და თანამშრომლობა
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                ჩაერთეთ დისკუსიებში სკოლის მოსწავლეების მიერ გამოქვეყნებულ პოსტებზე. გააზიარეთ თქვენი მოსაზრებები,
                შესთავაზეთ გაუმჯობესებები და ითანამშრომლეთ იდეების დახვეწაზე.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="w-6 h-6 mr-2" />
                იდეების განვითარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                გამოიყენეთ საზოგადოების უკუკავშირი თქვენი იდეების გასაუმჯობესებლად. დააკვირდით, რომელი იდეები იღებენ მეტ
                მხარდაჭერას და რატომ.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Award className="w-6 h-6 mr-2" />
                რეალიზაცია და აღიარება
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                საუკეთესო იდეები შეიძლება წარედგინოს ადგილობრივ ხელისუფლებას ან სკოლის ადმინისტრაციას განსახორციელებლად.
                მიიღეთ აღიარება თქვენი წვლილისთვის.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 bg-background">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">ხშირად დასმული კითხვები</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full"
          >
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Users className="w-6 h-6 mr-2 text-primary" />
                  ვინ შეიძლება გამოიყენოს ZeForum?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  პლატფორმა ღიაა ყველა სკოლის მოსწავლისთვის, მასწავლებლისთვის და ადგილობრივი მაცხოვრებლისთვის. საჭიროა
                  მხოლოდ რეგისტრაცია.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Lightbulb className="w-6 h-6 mr-2 text-primary" />
                  რა სახის იდეები შემიძლია გავაზიარო?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ნებისმიერი ინიციატივა რომელიც ეხება: გარემოს დაცვას, განათლების გაუმჯობესებას,
                  ინფრასტრუქტურის განვითარებას ან სოციალურ პრობლემებს. მთავარია იდეა იყოს კონკრეტული და რეალიზებადი.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Shield className="w-6 h-6 mr-2 text-primary" />
                  როგორ ვიზღუდავთ შეუფასებელ კონტენტს?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ყველა პოსტი შექმნილია სკოლის მოსწავლეებისა და მასწავლებლების მიერ.
                  ჩვენ მივყვებით წესებს რათა გადმოგცეთ საუკეთესო ტიპის კონტენტი.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="h-full hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <HelpCircle className="w-6 h-6 mr-2 text-primary" />
                  როგორ შემიძლია დავიწყო?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  1. დარეგისტრირდით ელ.ფოსტით ან Google-ს ანგარიშით<br />
                  2. დაათვალიერეთ პოსტები რომლებიც ატვირთული იქნა მასწავლებლების და მოსწავლეების მიერ<br />
                  3. დაიწყეთ იდეების გაზიარება კომენტარების საშუალებით<br />
                  4. მიიღეთ უკუკავშირი საზოგადოებისგან
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-card rounded-2xl p-8 md:p-12 shadow-lg"
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <Target className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">მოამზადე ცვლილებებისთვის</h2>
            <p className="text-xl text-muted-foreground mb-8">
              შემოგვიერთდი და გახდით აქტიური მომხმარებელი, ვინც უკვე ქმნის რეალურ გავლენას ჩვენს თემზე.
              დაწყებას მხოლოდ 1 წუთი სჭირდება!
            </p>
            {!user && (
              <Link href="/login">
                <Button size="lg" className="px-8 py-6 text-lg">
                  დარეგისტრირდი ახლავე
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  )
}